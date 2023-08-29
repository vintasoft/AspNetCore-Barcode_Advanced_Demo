/**
 A control that allows to view and edit properties of object (annotation, image processing command, etc).
 @param {object} propertyGrid An instance, of WebPropertyGridJS class, that contains information about object properties.
 @param {string} placeHolderID Identifier of placeholder element.
 @param {object} settings Control settings. Optional parameter.
        Settings have following properties:
            hideNestedElements: {boolean} Indicates that property grid must hide nested elements. Default value true.
            showReadOnlyElements: {boolean} Indicates that property grid must show readonly elements only. Default value true.
            editable: {boolean} Indicates that property grid allows to edit elements. Default value true.
 @param {string} markupContainerId Identifier of container element.
*/
PropertyGridControlJS = function (propertyGrid, placeHolderID, settings) {

    /**
     Gets an identifier of container where control will be placed.
    */
    PropertyGridControlJS.prototype.get_PlaceHolderID = function () {
        return this._placeHolderID;
    }

    /**
     Creates a control markup in a placeholder container.
    */
    PropertyGridControlJS.prototype.createMarkup = function () {
        if (this._rootItem == null)
            this.__initializeRootItem();
        // create HTML markup for root item of property grid control
        var markup = this._rootItem.createMarkup();
        this.__initializeMarkup(markup);
    }

    /**
     Clears a control markup in a placeholder container.
    */
    PropertyGridControlJS.prototype.removeMarkup = function () {
        document.querySelector("#" + this._placeHolderID).innerHTML;
        this._rootItem = null;
    }

    /**
     Places the specified markup into placeholder container and subscribes to the changes.
    */
    PropertyGridControlJS.prototype.__initializeMarkup = function (markup) {
        // place markup
        document.querySelector("#" + this._placeHolderID).innerHTML = markup;
        // enable the propertyChanged event of root item
        this._rootItem.enablePropertyChangedEvent();
    }

    /**
     Initializes the root item of this control.
    */
    PropertyGridControlJS.prototype.__initializeRootItem = function () {
        // get information about "object" propeties
        var objectPropertyInfo = this._propertyGrid.get_ObjectProperties();
        // create root item of property grid dialog
        this._rootItem = PropertyGridDialogItemFactoryJS.create(this._placeHolderID, objectPropertyInfo,
            this._showReadOnlyElements, this._canEdit, this._hideNestedElements);

        // subscribe to the propertyChanged event of root item

        var that = this;

        /**
         Property, of root item, is changed.
         @param {object} event Event data.
         @function @private
        */
        function __propertyChanged(event, data) {
            var propertyGridControl = that;

            Vintasoft.Shared.triggerEvent(propertyGridControl, "propertyChanged", data);

            // retrieve new property value from event parameters
            var propertyValue = data.newValue;
            // get the full property name
            var fullPropertyName = data.fullPropertyName;
            // set the property value
            var setResults = propertyGridControl._propertyGrid.setPropertyValue(fullPropertyName, propertyValue);
            // get the changed properties
            var changedProperties = setResults.changedProperties;
            // if the exception occurred during setting of property value
            if (setResults.exception != null)
                // show the exception message
                alert(setResults.exception.message);
            var rootItem = propertyGridControl._rootItem;
            if (rootItem == null)
                return;
            // get the updated HTML markup of root item
            var answer = rootItem.updateMarkup(changedProperties);
            // for each updated HTML markup
            for (var i = 0; i < answer.length; i++) {
                // get item identifier
                var id = answer[i].id;
                // get item markup
                var markup = answer[i].markup;
                // get element of property grid dialog
                var element = answer[i].element;
                // if root item is changed
                if (element === rootItem) {
                    propertyGridControl.__initializeMarkup(markup);
                    return;
                }
                // if item identifier is NOT empty
                else {
                    var trHead = document.querySelector("#" + id + "_tr");
                    var trContent = document.querySelector("#" + id + "_tr_content");

                    trContent.parentNode.insertBefore(markup, trContent.nextSibling);
                    trHead.parentNode.removeChild(trHead);
                    trContent.parentNode.removeChild(trContent);
                    // enables the propertyChanged event of element
                    element.enablePropertyChangedEvent();
                }
            }
        }

        // subscribe to the propertyChanged event of root item
        Vintasoft.Shared.subscribeToEvent(this._rootItem, "propertyChanged", __propertyChanged);
    }



    // get the containers with specified identifier
    var containers = document.querySelector("#" + placeHolderID);
    // if container is not found
    if (containers.length === 0)
        throw new Error("Control container with ID '" + placeHolderID + "' is not found.");
    // if there are several containers with the specified identifier
    if (containers.length > 1)
        throw new Error("Page contains more than 1 container with ID '" + placeHolderID + "'.");
    // identifier of control container
    this._placeHolderID = placeHolderID;

    // if "propertyGrid" parameter is NOT an instance of WebPropertyGridJS class
    if (!(propertyGrid instanceof Vintasoft.Shared.WebPropertyGridJS))
        throw new Error("PropertyGrid parameter is NOT an instance of WebPropertyGridJS class.");
    // object that contains information about "object" properties
    this._propertyGrid = propertyGrid;

    // if "settings" parameter is not an object
    if (typeof settings !== "object") {
        // create default settings object
        settings = {
            hideNestedElements: true,
            showReadOnlyElements: true,
            editable: true
        };
    }

    // indicates that property grid must hide nested elements
    this._hideNestedElements = settings.hideNestedElements != null ? settings.hideNestedElements : true;

    // indicates that property grid must show readonly elements only
    this._showReadOnlyElements = settings.showReadOnlyElements != null ? settings.showReadOnlyElements : true;

    // indicates that property grid allows to edit elements
    this._canEdit = settings.editable != null ? settings.editable : true;

    this.__initializeRootItem();
}





/**
 Base class for an item of property grid dialog.
 @param {string} placeHolderId An identifier of container where item will be placed.
 @param {object} item An instance of WebPropertyInfoJS class that contains information about the property of object.
 @param {boolean} showReadOnlyElements Indicates that property grid must show readonly elements only.
 @param {boolean} canEdit Indicates that property grid allows to edit element.
 @public @class
 @constructor
*/
PropertyGridDialogItemJS = function (placeHolderId, item, showReadOnlyElements, canEdit) {

    // ========================= BEGIN CONSTRUCTOR ==========================

    this._placeHolderId = placeHolderId;
    this._item = item;
    this._showReadOnlyElements = showReadOnlyElements;
    this._canEdit = canEdit;

    // ========================= END CONSTRUCTOR ==========================



    // ========================= BEGIN PUBLIC METHODS ======================

    /**
     Creates HTML markup for current element.
    */
    PropertyGridDialogItemJS.prototype.createMarkup = function () {
        throw new Error("NotImplementedException.");
    }

    /**
     Updates HTML markup for changed element.
    */
    PropertyGridDialogItemJS.prototype.updateMarkup = function (changedProperty) {
    }


    /**
     Enables the propertyChanged event of item.
    */
    PropertyGridDialogItemJS.prototype.enablePropertyChangedEvent = function () {
        if (!this._canEdit || this._item.get_ReadOnly())
            return;
        var that = this;
        var domElement = this.getDomElement();
        if (domElement != null) {
            Vintasoft.Shared.subscribeToEvent(domElement, "change", function (event) {
                that.onValueChanged(event);
            });
        }
    }

    /**
     HTML object value is changed.
    */
    PropertyGridDialogItemJS.prototype.onValueChanged = function (event) {
        // get HTML object which was changed
        var target = event.target || event.srcElement;
        // get full property name from ID of HTML object
        var fullPropertyName = target.id;

        // get new value
        var value = target.value;
        if (target.type === "checkbox") {
            if (target.checked)
                value = "True";
            else
                value = "False";
        }
        // get root item
        var parent = this;
        while (parent._parent != null)
            parent = parent._parent;

        var param = {
            newValue: value,
            fullPropertyName: fullPropertyName,
            htmlElement: target
        };

        // raise the "propertyChanged" event
        Vintasoft.Shared.triggerEvent(parent, "propertyChanged", param);

        return false;
    }

    /**
     Returns DOM element of this item.
    */
    PropertyGridDialogItemJS.prototype.getDomElement = function (domElementSelector) {
        var id = this._item.get_FullName() == "" ? "value" : this._item.get_FullName();
        var querySelector = "#" + this._placeHolderId + " #" + id;
        if (domElementSelector != null)
            querySelector = querySelector + domElementSelector;
        return document.querySelector(querySelector);
    }

    /**
     Returns all DOM elements of this item.
    */
    PropertyGridDialogItemJS.prototype.getAllDomElements = function (domElementSelector) {
        var id = this._item.get_FullName() == "" ? "value" : this._item.get_FullName();
        var querySelector = "#" + this._placeHolderId + " #" + id;
        if (domElementSelector != null)
            querySelector = querySelector + domElementSelector;
        return document.querySelectorAll(querySelector);
    }

    // ========================= END PUBLIC METHODS ======================
}





/**
 Represents a property grid dialog item for numeric value.
 @param {string} placeHolderId An identifier of container where item will be placed.
 @param {object} item An instance of WebPropertyInfoJS class that contains information about the property of object.
 @param {boolean} showReadOnlyElements Indicates that property grid must show readonly elements only.
 @param {boolean} canEdit Indicates that property grid allows to edit element.
 @public @class
 @constructor
*/
PropertyGridDialogNumericItemJS = function (placeHolderId, item, showReadOnlyElements, canEdit) {

    // ========================= BEGIN CONSTRUCTOR ==========================

    PropertyGridDialogNumericItemJS.superclass.constructor.apply(this, arguments);

    // ========================= END CONSTRUCTOR ==========================



    // ========================= BEGIN PUBLIC METHODS ======================

    /**
     Creates HTML markup for current element.
    */
    PropertyGridDialogNumericItemJS.prototype.createMarkup = function () {
        var objectValue = this._item.get_Value();
        var readOnly = this._item.get_ReadOnly();
        var name = this._item.get_ShortName() === "" ? "value" : this._item.get_ShortName();
        var id = this._item.get_FullName() === "" ? "value" : this._item.get_FullName();

        var htmlMarkup = "";

        if (readOnly && !this._showReadOnlyElements)
            return htmlMarkup;

        htmlMarkup += '<tr id="' + id + '_tr"><td>';
        htmlMarkup += '<label>' + name + ':</label> </td><td>';
        htmlMarkup += '<input id="' + id + '" type="number" step="1" value="' + objectValue.toFixed(2) + '"';
        if (readOnly || !this._canEdit)
            htmlMarkup += ' disabled ';
        htmlMarkup += '\></td></tr>';
        return htmlMarkup;
    }

    /**
     Updates HTML markup for changed element.
    */
    PropertyGridDialogNumericItemJS.prototype.updateMarkup = function (changedProperty) {
        var newItem = changedProperty;
        if (this._item.get_FullName() === newItem.get_FullName()) {
            this._item = newItem;
            var domElement = this.getDomElement();
            domElement.value = this._item.get_Value().toFixed(2);
        }
    }

    // ========================= END PUBLIC METHODS ======================

}
Vintasoft.Shared.extend(PropertyGridDialogNumericItemJS, PropertyGridDialogItemJS);





/**
 Represents a property grid dialog item for boolean value.
 @param {string} placeHolderId An identifier of container where item will be placed.
 @param {object} item An instance of WebPropertyInfoJS class that contains information about the property of object.
 @param {boolean} showReadOnlyElements Indicates that property grid must show readonly elements only.
 @param {boolean} canEdit Indicates that property grid allows to edit element.
 @public @class
 @constructor
*/
PropertyGridDialogBooleanItemJS = function (placeHolderId, item, showReadOnlyElements, canEdit) {

    // ========================= BEGIN CONSTRUCTOR ==========================

    PropertyGridDialogBooleanItemJS.superclass.constructor.apply(this, arguments);

    // ========================= END CONSTRUCTOR ==========================



    // ========================= BEGIN PUBLIC METHODS ======================

    /**
     Creates HTML markup for current element.
    */
    PropertyGridDialogBooleanItemJS.prototype.createMarkup = function () {
        var objectValue = this._item.get_Value();
        var readOnly = this._item.get_ReadOnly();
        var name = this._item.get_ShortName() === "" ? "value" : this._item.get_ShortName();
        var id = this._item.get_FullName() === "" ? "value" : this._item.get_FullName();

        var htmlMarkup = "";

        if (readOnly && !this._showReadOnlyElements)
            return htmlMarkup;

        htmlMarkup += '<tr id="' + id + '_tr"><td>';
        htmlMarkup += '<label>' + name + ':</label> </td><td>';
        if (this._canEdit) {
            htmlMarkup += '<input id="' + id + '" type="checkbox"';
            if (objectValue === true)
                htmlMarkup += ' checked';
            if (readOnly)
                htmlMarkup += ' disabled ';
        }
        else
            htmlMarkup += '<input id="' + id + '" type="text" value="' + objectValue + '"+ disabled ';
        htmlMarkup += '/></td></tr>';
        return htmlMarkup;
    }

    /**
     Updates HTML markup for changed element.
    */
    PropertyGridDialogBooleanItemJS.prototype.updateMarkup = function (changedProperty) {
        var newItem = changedProperty;
        if (this._item.get_FullName() === newItem.get_FullName()) {
            this._item = newItem;
            var domElement = this.getDomElement();
            domElement.checked = this._item.get_Value();
        }
    }

    // ========================= END PUBLIC METHODS ======================

}
Vintasoft.Shared.extend(PropertyGridDialogBooleanItemJS, PropertyGridDialogItemJS);





/**
 Represents a property grid dialog item for a date.
 @param {string} placeHolderId An identifier of container where item will be placed.
 @param {object} item An instance of WebPropertyInfoJS class that contains information about the property of object.
 @param {boolean} showReadOnlyElements Indicates that property grid must show readonly elements only.
 @param {boolean} canEdit Indicates that property grid allows to edit element.
 @public @class
 @constructor
*/
PropertyGridDialogDateItemJS = function (placeHolderId, item, showReadOnlyElements, canEdit) {

    // ========================= BEGIN CONSTRUCTOR ==========================

    PropertyGridDialogDateItemJS.superclass.constructor.apply(this, arguments);

    // ========================= END CONSTRUCTOR ==========================



    // ========================= BEGIN PUBLIC METHODS ======================

    /**
     Creates HTML markup for current element.
    */
    PropertyGridDialogDateItemJS.prototype.createMarkup = function () {
        var objectValue = this._item.get_Value();
        var readOnly = this._item.get_ReadOnly();
        var name = this._item.get_ShortName() === "" ? "value" : this._item.get_ShortName();
        var id = this._item.get_FullName() === "" ? "value" : this._item.get_FullName();

        var htmlMarkup = "";

        if (readOnly && !this._showReadOnlyElements)
            return htmlMarkup;

        htmlMarkup = '<tr id="' + id + '_tr"><td>';
        htmlMarkup += '<label>' + name + ':</label> </td><td>';
        htmlMarkup += '<input id="' + id + '" type="text" value="' + __convertDate(objectValue) + '"';
        if (readOnly || !this._canEdit)
            htmlMarkup += ' disabled ';
        htmlMarkup += 'style="width:95%"/></td></tr>';
        return htmlMarkup;
    }

    /**
     Updates HTML markup for changed element.
    */
    PropertyGridDialogDateItemJS.prototype.updateMarkup = function (changedProperty) {
        var newItem = changedProperty;
        if (this._item.get_FullName() === newItem.get_FullName()) {
            this._item = newItem;
            var domElement = this.getDomElement();
            domElement.value = __convertDate(this._item.get_Value());
        }
    }

    /**
     Converts date to a string.
    */
    function __convertDate(date) {
        var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        var minutes = date.getMinutes();
        var minutesAsString;
        if (minutes < 10)
            minutesAsString = "0" + minutes;
        else
            minutesAsString = "" + minutes;
        return month + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + minutesAsString;
    }

    // ========================= END PUBLIC METHODS ======================

}
Vintasoft.Shared.extend(PropertyGridDialogDateItemJS, PropertyGridDialogItemJS);





/**
 Represents a property grid dialog item for an enum.
 @param {string} placeHolderId An identifier of container where item will be placed.
 @param {object} item An instance of WebPropertyInfoJS class that contains information about the property of object.
 @param {boolean} showReadOnlyElements Indicates that property grid must show readonly elements only.
 @param {boolean} canEdit Indicates that property grid allows to edit element.
 @public @class
 @constructor
*/
PropertyGridDialogEnumItemJS = function (placeHolderId, item, showReadOnlyElements, canEdit) {

    // ========================= BEGIN CONSTRUCTOR ==========================

    PropertyGridDialogEnumItemJS.superclass.constructor.apply(this, arguments);

    var TWO_PWR_16_DBL = 1 << 16;
    var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
    this._locked = false;
    this._compositeItems = [];
    this._previousSelectedItems = [];

    // ========================= END CONSTRUCTOR ==========================



    // ========================= BEGIN PUBLIC METHODS ======================

    /**
     Creates HTML markup for current element.
    */
    PropertyGridDialogEnumItemJS.prototype.createMarkup = function () {
        var objectValue = this._item.get_Value();
        var readOnly = this._item.get_ReadOnly();
        var name = this._item.get_ShortName() === "" ? "value" : this._item.get_ShortName();
        var id = this._item.get_FullName() === "" ? "value" : this._item.get_FullName();
        var isFlagged = objectValue.isFlagged();

        var htmlMarkup = "";

        if (readOnly && !this._showReadOnlyElements)
            return htmlMarkup;

        htmlMarkup = '<tr id="' + id + '_tr"><td>';
        htmlMarkup += '<label>' + name + ':</label> </td><td>';

        var enumNames = objectValue.getAllAvailableNames();
        var enumValues = objectValue.getAllAvailableValues();
        var sortedEnumArray = [];
        for (var i = enumNames.length - 1; i >= 0; i--) {
            sortedEnumArray.push({ name: enumNames[i], value: enumValues[i] });
            if (isFlagged && !__isPowerOfTwo(enumValues[i]) && enumValues[i] !== 0)
                this._compositeItems.push(new objectValue.constructor(enumValues[i]));
        }
        sortedEnumArray.sort(__sortFlaggedEnumArray);

        if (enumNames.length != 0) {
            // create a drop down list with enum values
            htmlMarkup += '<select id="' + id + '"';

            if (readOnly || !this._canEdit)
                htmlMarkup += ' disabled';

            // if value is represented by flag enumeration
            if (isFlagged) {
                htmlMarkup += ' multiple="multiple">';

                // for each value supported by enumeration
                for (var j = 0; j < sortedEnumArray.length; j++) {
                    if (sortedEnumArray[j].value !== 0) {
                        if ((objectValue & sortedEnumArray[j].value) != 0) {
                            htmlMarkup += '<option value="' + sortedEnumArray[j].value + '" selected="selected">' + sortedEnumArray[j].name + '</option>';
                        }
                        else {
                            htmlMarkup += '<option value="' + sortedEnumArray[j].value + '">' + sortedEnumArray[j].name + '</option>';
                        }
                    }
                }
            }
            // if value is represented by not flag enumeration
            else {
                htmlMarkup += '>';
                // for each value supported by enumeration
                for (var j = 0; j < sortedEnumArray.length; j++) {
                    if (objectValue.toString() === sortedEnumArray[j].name) {
                        htmlMarkup += '<option value="' + sortedEnumArray[j].value + '" selected="selected">' + sortedEnumArray[j].name + '</option>';
                    }
                    else {
                        htmlMarkup += '<option value="' + sortedEnumArray[j].value + '">' + sortedEnumArray[j].name + '</option>';
                    }
                }
            }
            htmlMarkup += '</select>';
        }
        htmlMarkup += '</td></tr>';
        return htmlMarkup;
    }

    /**
     Updates HTML markup for changed element.
    */
    PropertyGridDialogEnumItemJS.prototype.updateMarkup = function (changedProperty) {
        var newItem = changedProperty;
        if (this._item.get_FullName() === newItem.get_FullName()) {
            this._item = newItem;
            var value = this._item.get_Value();
            var id = this._item.get_FullName() == "" ? "value" : this._item.get_FullName();
            if (value.isFlagged()) {
                var selectedValues = __getSelectedValues(this);
                this._locked = true;
                this.set_MultipleValues(selectedValues);
                this._locked = false;
            }
            else {
                this.set_SingleValue(value);
            }
        }
    }

    /**
     Enables the propertyChanged event of item.
    */
    PropertyGridDialogEnumItemJS.prototype.enablePropertyChangedEvent = function () {
        var value = this._item.get_Value();
        if (value.isFlagged()) {
            var id = this._item.get_FullName() == "" ? "value" : this._item.get_FullName();
            this.init_MultiSelectorControl();
            var selectedValues = __getSelectedValues(this);
            this._locked = true;
            this.set_MultipleValues(selectedValues);
            this._locked = false;
        }
        PropertyGridDialogEnumItemJS.superclass.enablePropertyChangedEvent.apply(this, arguments);
    }

    /**
     HTML object value is changed.
    */
    PropertyGridDialogEnumItemJS.prototype.onValueChanged = function (event) {
        if (this._locked)
            return;
        var val = this._item.get_Value();
        var id = this._item.get_FullName() == "" ? "value" : this._item.get_FullName();
        var isFlagged = val.isFlagged();
        var newVal;
        if (!isFlagged) {
            var domElement = this.getDomElement();
            var selectedValue = domElement.options[domElement.selectedIndex].value;
            var newVal = new val.constructor(Number(selectedValue));
        }
        else {
            var selectedValues = this.get_MultipleValues();
            if (selectedValues.length === 0) {
                try {
                    newVal = new val.constructor(0);
                }
                catch (e) {
                    return;
                }
            }
            else {
                newVal = new val.constructor(Number(selectedValues[0]));
                for (var i = 1; i < selectedValues.length; i++)
                    newVal = newVal.add(Number(selectedValues[i]));

                if (selectedValues.length < this._previousSelectedItems.length) {
                    var differences = [];
                    for (var i = 0; i < this._previousSelectedItems.length; i++)
                        if (selectedValues.indexOf("" + this._previousSelectedItems[i]) == -1)
                            differences.push(this._previousSelectedItems[i]);

                    var differenceEnum = new val.constructor(Number(differences[0]));
                    for (var i = 1; i < differences.length; i++)
                        differenceEnum = differenceEnum.add(Number(differences[i]));

                    newVal = newVal.remove(differenceEnum);
                }
            }
        }
        // get root item
        var parent = this;
        while (parent._parent != null)
            parent = parent._parent;

        var param = {
            newValue: newVal,
            fullPropertyName: id
        };

        // raise the "propertyChanged" event
        Vintasoft.Shared.triggerEvent(parent, "propertyChanged", param);

        return false;
    }

    PropertyGridDialogEnumItemJS.prototype.set_SingleValue = function (value) {
        var domElement = this.getDomElement();
        $(domElement).val(value.valueOf());
    }

    PropertyGridDialogEnumItemJS.prototype.set_MultipleValues = function (selectedValues) {
        var domElement = this.getDomElement();
        $(domElement).val(selectedValues);
    }

    PropertyGridDialogEnumItemJS.prototype.get_MultipleValues = function () {
        var domElement = this.getDomElement();
        return $(domElement).val();
    }

    PropertyGridDialogEnumItemJS.prototype.init_MultiSelectorControl = function () {
        var domElement = this.getDomElement();
        $(domElement).multiselect({
            includeSelectAllOption: true,
            buttonClass: 'form-select',
            templates: {
                button: '<button type="button" class="multiselect dropdown-toggle" data-bs-toggle="dropdown"><span class="multiselect-selected-text"></span></button>',
            }
        });
    }

    // ========================= END PUBLIC METHODS ======================


    // ========================= BEGIN PRIVATE METHODS ===================


    /**
     Compare function for {name,value} array.
    */
    function __sortFlaggedEnumArray(first, second) {
        if (first.name == second.name)
            return 0;
        if (first.name < second.name)
            return -1;
        else
            return 1;
    }

    /**
     Returns all enum values for current state of select element.
    */
    function __getSelectedValues(that) {
        var selectedValues = [];
        var value = that._item.get_Value();
        if (value.isFlagged()) {
            for (var i = 0; i < that._compositeItems.length; i++) {
                if (value.equals(that._compositeItems[i])) {
                    selectedValues.push(that._compositeItems[i].valueOf());
                    value = null;
                    break;
                }
                if (value.contains(that._compositeItems[i])) {
                    selectedValues.push(that._compositeItems[i].valueOf())
                    value.remove(that._compositeItems[i]);
                }
            }
            if (value != null) {
                var valueAsArray = value.toArray();
                for (var i = 0; i < valueAsArray.length; i++)
                    selectedValues.push(valueAsArray[i].valueOf());
            }
        }
        that._previousSelectedItems = selectedValues;
        return selectedValues;
    }

    /**
     Determines that specified value is a power of 2.
     @param {number} val Integer numeric value.
     @returns True - if value is a power of 2; otherwise, false.
    */
    function __isPowerOfTwo(val) {
        return (val !== 0) && (__bitwiseAndLarg(val, val - 1) === 0);
    }

    /**
     Returns 32-bit values that represent high and low bits of specified number.
     @param {number} val Number.
     @returns {object} Object that stores 32-bit values that represent high and low bits of specified number.
     @function @private
    */
    function __toLowAndHighBits(val) {
        var low = (val % TWO_PWR_32_DBL) | 0;
        var high = (val / TWO_PWR_32_DBL) | 0;
        return { low: low, high: high };
    }


    /**
     Applies a bitwise AND operation to the two numbers.
     @param {number} val1 The first operand.
     @param {number} val2 The second operand.
     @returns {number} Result.
     @function @private
    */
    function __bitwiseAndLarg(val1, val2) {
        var first = __toLowAndHighBits(val1);
        var second = __toLowAndHighBits(val2);
        return __fromLowAndHighBitsToNumber(first.low & second.low, first.high & second.high);
    }

    /**
     Returns a number represented by high 32-bits and low 32-bits.
     @param {number} Hight 32-bits.
     @param {number} Low 32-bits.
     @returns {number} Number.
     @function @private 
    */
    function __fromLowAndHighBitsToNumber(low, high) {
        return high * TWO_PWR_32_DBL + (low >>> 0);
    }

    // ========================= END PRIVATE METHODS ===================

}
Vintasoft.Shared.extend(PropertyGridDialogEnumItemJS, PropertyGridDialogItemJS);





/**
 Represents a property grid dialog item for a string.
 @param {string} placeHolderId An identifier of container where item will be placed.
 @param {object} item An instance of WebPropertyInfoJS class that contains information about the property of object.
 @param {boolean} showReadOnlyElements Indicates that property grid must show readonly elements only.
 @param {boolean} canEdit Indicates that property grid allows to edit element.
 @public @class
 @constructor
*/
PropertyGridDialogStringItemJS = function (placeHolderId, item, showReadOnlyElements, canEdit) {

    // ========================= BEGIN CONSTRUCTOR ==========================

    PropertyGridDialogStringItemJS.superclass.constructor.apply(this, arguments);

    // ========================= END CONSTRUCTOR ==========================



    // ========================= BEGIN PUBLIC METHODS ======================

    /**
     Creates HTML markup for current element.
    */
    PropertyGridDialogStringItemJS.prototype.createMarkup = function () {
        var objectValue = this._item.get_Value();
        var readOnly = this._item.get_ReadOnly();
        var name = this._item.get_ShortName() === "" ? "value" : this._item.get_ShortName();
        var id = this._item.get_FullName() === "" ? "value" : this._item.get_FullName();

        var htmlMarkup = "";

        if (readOnly && !this._showReadOnlyElements)
            return htmlMarkup;

        htmlMarkup = '<tr id="' + id + '_tr"><td>';
        htmlMarkup += '<label>' + name + ':</label> </td><td>';

        // create a text input
        htmlMarkup += '<input id="' + id + '" type=\'text\' value=\"' + objectValue + '\"  style="width:95%"';
        if (readOnly || !this._canEdit)
            htmlMarkup += " disabled ";
        htmlMarkup += '\></td></tr>';
        return htmlMarkup;
    }

    /**
     Updates HTML markup for changed element.
    */
    PropertyGridDialogStringItemJS.prototype.updateMarkup = function (changedProperty) {
        if (this._item.get_FullName() === changedProperty.get_FullName()) {
            this._item = changedProperty;
            var domElement = this.getDomElement();
            domElement.value = this._item.get_Value();
        }
    }

    // ========================= END PUBLIC METHODS ======================
}
Vintasoft.Shared.extend(PropertyGridDialogStringItemJS, PropertyGridDialogItemJS);





/**
 Represents a property grid dialog item for a font family value.
 @param {string} placeHolderId An identifier of container where item will be placed.
 @param {object} item An instance of WebPropertyInfoJS class that contains information about the property of object.
 @param {boolean} showReadOnlyElements Indicates that property grid must show readonly elements only.
 @param {boolean} canEdit Indicates that property grid allows to edit element.
 @public @class
 @constructor
*/
PropertyGridDialogFontFamilyItemJS = function (placeHolderId, item, showReadOnlyElement, canEdit) {

    // ========================= BEGIN CONSTRUCTOR ==========================

    PropertyGridDialogFontFamilyItemJS.superclass.constructor.apply(this, arguments);

    // ========================= END CONSTRUCTOR ==========================



    // ========================= BEGIN PUBLIC METHODS ======================

    /**
     Creates HTML markup for current element.
    */
    PropertyGridDialogFontFamilyItemJS.prototype.createMarkup = function () {
        var value = this._item.get_Value();
        var readOnly = this._item.get_ReadOnly();
        var name = this._item.get_ShortName() === "" ? "value" : this._item.get_ShortName();
        var id = this._item.get_FullName() === "" ? "value" : this._item.get_FullName();

        var htmlMarkup = "";

        if (readOnly && !this._showReadOnlyElements)
            return htmlMarkup;

        htmlMarkup = '<tr id="' + id + '_tr"><td>';
        htmlMarkup += '<label>' + name + ':</label> </td><td>';


        htmlMarkup += '<div style="width:95%; position:relative"><input id="' + id + '" value="' + value + '" style="position:absolute; width:calc(100% - 20px)"';
        if (readOnly || !this._canEdit) {
            htmlMarkup += ' disabled />';
        }
        else {
            htmlMarkup += '/>'

            // create a drop down list with fonts values
            htmlMarkup += '<select id="' + id + '_sel" style="width:100%">';

            var fonts = PropertyGridDialogFontFamilyItemJS.supportedFontFamilies;

            for (var i = 0; i < fonts.length; i++)
                htmlMarkup += '<option value="' + fonts[i] + '">' + fonts[i] + '</option>'
            htmlMarkup += '</select>';
        }
        htmlMarkup += '</div></td></tr>';
        return htmlMarkup;
    }

    /**
     Enables the propertyChanged event of item.
    */
    PropertyGridDialogFontFamilyItemJS.prototype.enablePropertyChangedEvent = function () {
        if (!this._canEdit || this._item.get_ReadOnly())
            return;
        var id = this._item.get_FullName() == "" ? "value" : this._item.get_FullName();

        var that = this;
        var domElement = this.getDomElement();
        var domElementSel = this.getDomElement("_sel");
        if (domElementSel != null) {
            Vintasoft.Shared.subscribeToEvent(domElementSel, "change", function (event) {
                // get input element
                var inputElement = domElement;
                // set value 
                inputElement.value = domElementSel.value;
                // change selected index
                that.selectedIndex = -1;
                // call onValueChanged method
                that.onValueChanged({ target: inputElement });
            });
        }

        if (domElement != null) {
            Vintasoft.Shared.subscribeToEvent(domElement, "change", function (event) {
                that.onValueChanged(event);
            });
        }
    }

    // ========================= END PUBLIC METHODS ======================

}

// List of default font families
PropertyGridDialogFontFamilyItemJS.supportedFontFamilies = ["Arial", "Courier New", "Verdana", "Times New Roman"];
Vintasoft.Shared.extend(PropertyGridDialogFontFamilyItemJS, PropertyGridDialogItemJS);





/**
 Represents a property grid dialog item for color value.
 @param {string} placeHolderId An identifier of container where item will be placed.
 @param {object} item An instance of WebPropertyInfoJS class that contains information about the property of object.
 @param {boolean} showReadOnlyElements Indicates that property grid must show readonly elements only.
 @param {boolean} canEdit Indicates that property grid allows to edit element.
 @public @class
 @constructor
*/
PropertyGridDialogColorItemJS = function (placeHolderId, item, showReadOnlyElements, canEdit) {

    // ========================= BEGIN CONSTRUCTOR ==========================

    PropertyGridDialogColorItemJS.superclass.constructor.apply(this, arguments);

    // ========================= END CONSTRUCTOR ==========================



    // ========================= BEGIN PUBLIC METHODS ======================

    /**
     Enables the propertyChanged event of item.
    */
    PropertyGridDialogColorItemJS.prototype.enablePropertyChangedEvent = function () {
        var domElement = this.getDomElement();
        $(domElement).colorpicker({ color: $(domElement).val(), format: 'rgba' });

        $(domElement).css('color', 'white');
        $(domElement).css('background-color', $(domElement).val());

        var that = this;

        var elementDisabled = !this._canEdit || this._item.get_ReadOnly();
        if (!elementDisabled) {
            $(domElement).on('colorpickerChange', function (event) {
                var backgroundColor = event.color;

                var textColor = "black";
                if (backgroundColor.isDark()) {
                    textColor = "white";
                }
                $(domElement).css('color', textColor);

                $(domElement).css('background-color', backgroundColor.toString());
                that.onValueChanged(event, backgroundColor.toString());
            });
        }
    }

    /**
     HTML Object value is changed.
    */
    PropertyGridDialogColorItemJS.prototype.onValueChanged = function (event, color) {
        // get full property name from ID of HTML object
        var fullPropertyName = event.target.id;

        if (this._item.get_Value() === color)
            return false;

        // get root item
        var parent = this;
        while (parent._parent != null)
            parent = parent._parent;

        var param = {
            newValue: color,
            fullPropertyName: fullPropertyName
        };
        // raise the "propertyChanged" event
        Vintasoft.Shared.triggerEvent(parent, "propertyChanged", param);
        return false;
    }

    // ========================= END PUBLIC METHODS ======================

}
Vintasoft.Shared.extend(PropertyGridDialogColorItemJS, PropertyGridDialogStringItemJS);





/**
 Represents a property grid dialog item for an object value.
 @param {string} placeHolderId An identifier of container where item will be placed.
 @param {object} item An instance of WebPropertyInfoJS class that contains information about the property of object.
 @param {boolean} showReadOnlyElements Indicates that property grid must show readonly elements only.
 @param {boolean} canEdit Indicates that property grid allows to edit element.
 @param {boolean} hideNestedElements Indicates that property grid must hide nested elements.
 @public @class
 @constructor
*/
PropertyGridDialogObjectItemJS = function (placeHolderId, item, showReadOnlyElements, canEdit, hideNestedElements) {

    // ========================= BEGIN CONSTRUCTOR ==========================

    PropertyGridDialogObjectItemJS.superclass.constructor.apply(this, arguments);

    this._hideNestedElements = hideNestedElements;

    // determines that element was collapsed
    this._isOpened = false;

    this._children = [];
    // creates a tree from element and element's children
    __createElementTree(this);

    // ========================= END CONSTRUCTOR ==========================



    // ========================= BEGIN PUBLIC METHODS ======================

    /**
     Creates HTML markup for current element.
    */
    PropertyGridDialogObjectItemJS.prototype.createMarkup = function () {
        var htmlMarkup = "";

        var readOnly = this._item.get_ReadOnly();
        var name = this._item.get_ShortName();
        var id = this._item.get_FullName();

        if (readOnly && !this._showReadOnlyElements)
            return htmlMarkup;

        if (name !== "" && isNaN(Number(name))) {
            var labelName = '';
            if (this._hideNestedElements) {
                if (this._isOpened)
                    labelName = "- " + name;
                else
                    labelName = "+ " + name;
            }
            else
                labelName = name;
            // add header for property
            htmlMarkup = '<tr id="' + id + '_tr" ><td class="spoiler';
            if (this._isOpened)
                htmlMarkup += ' open';
            htmlMarkup += '" colspan="2">';
            htmlMarkup += '<label>' + labelName + ':</label> </td></tr>';
            htmlMarkup += '<tr id="' + id + '_tr_content"><td colspan="2" style="padding-left:10px">';
        }
        htmlMarkup += '<table border="1" class="propertyTable">';
        for (var i = 0; i < this._children.length; i++)
            // create HTML markup using information from WebPropertyGridJS
            htmlMarkup += this._children[i].createMarkup();
        htmlMarkup += '</table>';
        if (name !== "" && isNaN(Number(name)))
            htmlMarkup += '</td></tr>';
        return htmlMarkup;
    }

    /**
     Updates HTML markup for changed elements.
    */
    PropertyGridDialogObjectItemJS.prototype.updateMarkup = function (changedProperties) {
        var answer = [];
        // if only 1 element is changed
        if (changedProperties.length == null)
            // create temporary array
            changedProperties = [changedProperties];

        // for each changed element
        for (var i = 0; i < changedProperties.length; i++) {
            // get new element
            var newItem = changedProperties[i];

            // if current element is changed
            if (this._item.get_FullName() === newItem.get_FullName()) {
                // set new current element
                this._item = newItem;
                // reset element's children
                this._children = [];

                // creates a tree from element and element's children
                __createElementTree(this);

                var newMarkup = this.createMarkup();
                answer.push({ markup: newMarkup, id: this._item.get_FullName(), element: this });
            }
            else {
                for (var j = 0; j < this._children.length; j++) {
                    var childAnswer = this._children[j].updateMarkup(newItem);
                    if (childAnswer != null)
                        answer = answer.concat(childAnswer);
                }
            }
        }
        return answer;
    }

    /**
     Enables the propertyChanged event of item.
    */
    PropertyGridDialogObjectItemJS.prototype.enablePropertyChangedEvent = function () {
        if (this._hideNestedElements) {
            var id = this._item.get_FullName();
            if (id !== "") {
                var element = this.getAllDomElements("_tr .spoiler");
                var spoilerElement = element[0];
                // collapse elements that have sub elements
                if (!this._isOpened)
                    spoilerElement.parentNode.nextElementSibling.style.display = 'none';

                Vintasoft.Shared.subscribeToEvent(spoilerElement, "click", (e) => {
                    e.data = { obj: this }
                    __spoiler_onMouseDown(e)
                });
            }
        }

        for (var i = 0; i < this._children.length; i++) {
            this._children[i].enablePropertyChangedEvent();
        }
    }

    // ========================= END PUBLIC METHODS ======================


    // ========================= BEGIN PRIVATE METHODS ======================

    /**
     Mouse cursor is down on spoiled element of "property grid UI".
     @function @private
    */
    function __spoiler_onMouseDown(event) {
        var spoiler = event.target.closest('.spoiler');
        var obj = event.data.obj;

        spoiler.classList.toggle("open");
        // get next table row
        var currentTr = spoiler.parentNode.nextElementSibling;

        var objectId = currentTr.id.replace("_tr_content", "");

        // expand the table row
        //currentTr.toggle();
        const display = currentTr.style.display;
        if (display !== "none")
            currentTr.style.display = "none";
        else
            currentTr.style.display = "";

        // if table row is visible
        var matches = function (el, selector) {
            return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
        };

        if (matches(currentTr, 'visible')/*currentTr.is(':visible')*/) {
            // get label
            var children = spoiler.children[0];
            var val = children.innerHTML;
            // change "+" to "-" char
            children.innerHTML = '- ' + val.substring(2);
            obj._isOpened = true;
        }
        else {
            var children = spoiler.children[0];
            var val = children.innerHTML;
            children.innerHTML = '+ ' + val.substring(2);
            obj._isOpened = false;
        }
    }

    /**
     Creates a tree from element and element's children.
    */
    function __createElementTree(obj) {
        var propertyInfos = obj._item.get_Items();
        for (var i = 0; i < propertyInfos.length; i++) {
            var item = propertyInfos[i];
            var child = PropertyGridDialogItemFactoryJS.create(obj._placeHolderId, item, obj._showReadOnlyElements, obj._canEdit, obj._hideNestedElements);
            child._parent = obj;
            obj._children.push(child);
        }
    }

    // ========================= END PRIVATE METHODS ======================

}
Vintasoft.Shared.extend(PropertyGridDialogObjectItemJS, PropertyGridDialogItemJS);





/**
 Fabric for elements of property grid dialog.
 @public @class @static
 @constructor
*/
PropertyGridDialogItemFactoryJS = function () { }

/**
 Creates the property grid dialog item for the specified WebPropertyInfoJS object.
 @param {string} placeHolderId An identifier of container where item will be placed.
 @param {object} objectPropertyInfo An instance of WebPropertyInfoJS class that contains information about the property of object.
 @param {boolean} showReadOnlyElements Indicates that property grid must show readonly elements only.
 @param {boolean} canEdit Indicates that property grid allows to edit element.
 @param {boolean} hideNestedElements Indicates that property grid must hide nested elements.
 @public @function
*/
PropertyGridDialogItemFactoryJS.create = function (placeHolderId, objectPropertyInfo, showReadOnlyElements,
    canEdit, hideNestedElements) {
    var resultObject = [];
    // get information about object properties
    var propertyInfos = objectPropertyInfo.get_Items();

    var objectValue = objectPropertyInfo.get_Value();
    var readOnly = objectPropertyInfo.get_ReadOnly();
    var name = objectPropertyInfo.get_ShortName();
    var id = objectPropertyInfo.get_FullName();

    if (propertyInfos.length !== 0 && !Array.isArray(objectValue)) {
        resultObject = new PropertyGridDialogObjectItemJS(placeHolderId, objectPropertyInfo, showReadOnlyElements, canEdit, hideNestedElements);
    }
    // if property does NOT have nested properties
    else {
        // depending on property value type
        switch (typeof objectValue) {
            case "number":
                // create HTML markup for numeric value
                resultObject = new PropertyGridDialogNumericItemJS(placeHolderId, objectPropertyInfo, showReadOnlyElements, canEdit);
                break;

            case "string":
                switch (name) {
                    // if property represents color
                    case "Color":
                    case "BackColor":
                    case "ForeColor":
                    case "fill":
                    case "stroke":
                    case "background-color":
                    case "selectedFill":
                    case "color":
                    case "FontColor":
                    case "BorderColor":
                    case "borderColor":
                    case "CanvasColor":
                    case "BackColorOfShadow":
                    case "BackgroundColor":
                    case "backgroundColor":
                    case "BlendColor":
                    case "OldColor":
                    case "NewColor":
                    case "FillColor":
                    case "TextColor":
                    case "TransparentColor":
                    case "FirstPointFillColor":
                    case "FirstPointBorderColor":
                    case "SecondPointFillColor":
                    case "SecondPointBorderColor":
                        resultObject = new PropertyGridDialogColorItemJS(placeHolderId, objectPropertyInfo, showReadOnlyElements, canEdit);
                        break;

                    // if property represents font family
                    case "FamilyName":
                    case "FontFamily":
                    case "fontFamily":
                    case "ValueFontFamily":
                        resultObject = new PropertyGridDialogFontFamilyItemJS(placeHolderId, objectPropertyInfo, showReadOnlyElements, canEdit);
                        break;

                    case "maskImage":
                    case "overlayImage":
                    case "image":
                    case "mask":
                    //break;

                    default:
                        resultObject = new PropertyGridDialogStringItemJS(placeHolderId, objectPropertyInfo, showReadOnlyElements, canEdit);
                        break;
                }
                break;

            case "boolean":
                resultObject = new PropertyGridDialogBooleanItemJS(placeHolderId, objectPropertyInfo, showReadOnlyElements, canEdit);
                break;

            case "object":
                if (objectValue instanceof Vintasoft.Shared.WebEnumItemBaseJS) {
                    resultObject = new PropertyGridDialogEnumItemJS(placeHolderId, objectPropertyInfo, showReadOnlyElements, canEdit);
                }
                else if (objectValue instanceof Date) {
                    resultObject = new PropertyGridDialogDateItemJS(placeHolderId, objectPropertyInfo, showReadOnlyElements, canEdit);
                }
                else if (objectValue instanceof Array) {
                    var canModifyElements = canEdit && !readOnly;
                    if (name === "Items" || name === "VisualTools") {
                        canModifyElements = true;
                    }

                    var str = '[';
                    for (var i = 0; i < objectValue.length; i++) {
                        str = str + objectValue[i];
                        if (i < (objectValue.length - 1))
                            str = str + ';';
                    }
                    str = str + ']';

                    var objectPropertyInfoStr = new Vintasoft.Shared.WebPropertyInfoJS(name, id, str, readOnly, objectPropertyInfo.get_RefreshFromParent());
                    resultObject = new PropertyGridDialogStringItemJS(placeHolderId, objectPropertyInfoStr, showReadOnlyElements, canEdit);
                }
                else {
                    resultObject = new PropertyGridDialogObjectItemJS(placeHolderId, objectPropertyInfo, showReadOnlyElements, canEdit, hideNestedElements);
                }
                break;
        }
    }
    return resultObject;
}
