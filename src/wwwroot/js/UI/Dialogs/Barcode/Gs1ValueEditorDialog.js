/**
 A dialog that allows to edit the GS1 value.
*/
Gs1ValueEditorDialogJS = function () {

    /**
     Updates the UI of this dialog.
     */
    Gs1ValueEditorDialogJS.prototype.updateUI = function () {
        var gs1PrintableValueItem = document.getElementById("gs1PrintableValue");
        gs1PrintableValueItem.value = this.__getGs1PrintableValue();

        this.__clearGs1ValueTable();

        const table = document.getElementById("gs1Value");
        // for each GS1 Application Identifier value in GS1 value
        for (var i = 0; i < this._gs1Value.length; i++) {
            // insert new row to a table that contains information about GS1 value
            const newRow = table.insertRow(-1);

            // insert 4 cells to the table row
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);
            const cell4 = newRow.insertCell(3);

            // get the GS1 Application Identifier value from GS1 value
            var gs1AppIdValue = this._gs1Value[i];

            // set information about GS1 Application Identifier value to the table cells
            cell1.textContent = gs1AppIdValue.appId;
            cell2.textContent = gs1AppIdValue.appIdName;
            cell3.textContent = gs1AppIdValue.appIdData;

            // create "Edit" button
            const editButton = document.createElement("button");
            // set button settings
            editButton.textContent = "Edit";
            editButton.type = "button";
            // save reference to the GS1 value editor dialog in custom field of button
            editButton.gs1ValueEditorDialog = this;
            // save index of the GS1 App Id object in custom field of button
            editButton.gs1AppIdValueIndex = i;
            // save reference to the GS1 App Id object in custom field of button
            editButton.gs1AppIdValue = gs1AppIdValue;
            // subscribe to the "click" event
            editButton.addEventListener("click", function () {
                // hide this dialog
                $('#gs1ValueEditorDialog').modal('hide');
                // open the dialog that allows to edit the Application Identifier value of GS1 value
                new Gs1AppIdValueEditorDialogJS(this.gs1ValueEditorDialog, this.gs1AppIdValueIndex, this.gs1AppIdValue.appId, this.gs1AppIdValue.appIdData);
            });
            // add "Edit" button to the table cell
            cell4.appendChild(editButton);

            // create "Delete" button
            const deleteButton = document.createElement("button");
            // set button settings
            deleteButton.textContent = "Delete";
            deleteButton.type = "button";
            // save reference to the GS1 value editor dialog in custom field of button
            deleteButton.gs1ValueEditorDialog = this;
            // save index of the GS1 App Id object in custom field of button
            deleteButton.gs1AppIdValueIndex = i;
            // subscribe to the "click" event
            deleteButton.addEventListener("click", function () {
                // remove GS1 Application Identifier value from the GS1 value
                this.gs1ValueEditorDialog.__removeAppIdValueFromGs1Value(this.gs1AppIdValueIndex);
                // update UI of this dialog
                this.gs1ValueEditorDialog.updateUI();
            });
            // add "Delete" button to the table cell
            cell4.appendChild(deleteButton);
        }
    }

    /**
     Adds the GS1 application identifier value to the GS1 value.
     */
    Gs1ValueEditorDialogJS.prototype.addAppIdValueToGs1Value = function (appId, appIdName, appIdData) {
        this._gs1Value.push({ appId: appId, appIdName: appIdName, appIdData: appIdData });
    }

    /**
     Changes the GS1 application identifier value in the GS1 value.
     */
    Gs1ValueEditorDialogJS.prototype.changeAppIdValueInGs1Value = function (appIdIndex, appId, appIdName, appIdData) {
        var gs1AppIdValue = this._gs1Value[appIdIndex];
        gs1AppIdValue.appId = appId;
        gs1AppIdValue.appIdName = appIdName;
        gs1AppIdValue.appIdData = appIdData;
    }


    /**
     Removes the GS1 application identifier value from the GS1 value.
     */
    Gs1ValueEditorDialogJS.prototype.__removeAppIdValueFromGs1Value = function (appIdIndex) {
        this._gs1Value.splice(appIdIndex, 1);
    }

    /**
     Returns the GS1 printable value.
     */
    Gs1ValueEditorDialogJS.prototype.__getGs1PrintableValue = function () {
        var gs1PrintableValue = "";
        for (var i = 0; i < this._gs1Value.length; i++) {
            gs1PrintableValue += "(" + this._gs1Value[i].appId + ")" + this._gs1Value[i].appIdData;
        }
        return gs1PrintableValue;
    }

    /**
     Clears the GS1 value table in UI of this dialog.
     */
    Gs1ValueEditorDialogJS.prototype.__clearGs1ValueTable = function () {
        const table = document.getElementById("gs1Value");
        const allRows = table.rows;
        while (allRows.length > 1) {
            allRows[1].remove();
        }
    }

    function __gs1ValueEditorDialog_okButton_clicked() {
        var okButton = document.getElementById("gs1ValueEditorDialog_okButton");
        // unsubscribe from the "click" event of "Ok" button
        okButton.removeEventListener("click", __gs1ValueEditorDialog_okButton_clicked);

        var copyValueToClipboardButton = document.getElementById("gs1ValueEditorDialog_copyValueToClipboadButton");
        // unsubscribe from the "click" event of "Copy value to clipboard" button
        copyValueToClipboardButton.removeEventListener("click", __gs1ValueEditorDialog_copyValueToClipboadButton_clicked);
    }

    function __gs1ValueEditorDialog_copyValueToClipboadButton_clicked() {
        var gs1PrintableValueItem = document.getElementById("gs1PrintableValue");
        gs1PrintableValueItem.select();
        document.execCommand("copy");
        alert("GS1 printable value is copied to the clipboard.");
    }

    /**
     Initializes this dialog.
     */
    Gs1ValueEditorDialogJS.prototype.__init = function () {
        var okButton = document.getElementById("gs1ValueEditorDialog_okButton");
        // subscribe to the "click" event of "Ok" button
        okButton.addEventListener("click", __gs1ValueEditorDialog_okButton_clicked);

        var copyValueToClipboardButton = document.getElementById("gs1ValueEditorDialog_copyValueToClipboadButton");
        // subscribe to the "click" event of "Copy value to clipboard" button
        copyValueToClipboardButton.addEventListener("click", __gs1ValueEditorDialog_copyValueToClipboadButton_clicked);

        var addGs1AppIdValueItem = document.getElementById("addGs1AppIdValue");
        addGs1AppIdValueItem.gs1ValueEditorDialog = this;
        addGs1AppIdValueItem.addEventListener("click", function () {
            // hide this dialog
            $('#gs1ValueEditorDialog').modal('hide');
            // open the dialog that allows to edit the Application Identifier value of GS1 value
            new Gs1AppIdValueEditorDialogJS(this.gs1ValueEditorDialog, -1, "00", "");
        });

        // update UI of this dialog
        this.updateUI();

        // show this dialog
        $('#gs1ValueEditorDialog').modal('show');
    }



    // GS1 value (an array of GS1 Application Identifier values)
    this._gs1Value = [
        { appId: "01", appIdName: "GTIN", appIdData: "01234567890128" },
        { appId: "17", appIdName: "USE BY OR EXPIRY", appIdData: "091115" }
    ];

    // initialize this dialog
    this.__init();

}
