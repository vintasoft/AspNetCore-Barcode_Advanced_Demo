﻿// Copyright 2014-2023 VintaSoft Ltd. All rights reserved.
// This software is protected by International copyright laws.
// Any copying, duplication, deployment, redistribution, modification or other
// disposition hereof is STRICTLY PROHIBITED without an express written license
// granted by VintaSoft Ltd. This notice may not be removed or otherwise
// altered under any circumstances.
// This code may NOT be used apart of the VintaSoft product.
var Vintasoft;
(function(a){function b(b,a,n){b=h[b];for(var f="",d=a;d<a+n;d++)f+=String.fromCharCode(b[d]^255);return f}if(void 0==a||void 0==a.Shared)throw Error("Vintasoft.Shared is not found.");if("4.0.0.3"!==a.version)throw Error("Wrong version of Vintasoft.Shared script.");if(void 0==a.Imaging)throw Error("Vintasoft.Imaging is not found.");if("12.2.8.1"!==a.Imaging.version)throw Error("Wrong version of Vintasoft.Imaging script.");var h=[];h.push([146,144,155,158,147,210,156,144,145,139,154,145,139,146,144,
155,158,147,210,153,144,144,139,154,141,146,144,155,158,147,223,153,158,155,154,145,144,145,154,146,144,155,158,147,210,151,154,158,155,154,141,146,144,155,158,147,210,157,144,155,134,146,144,155,158,147,223,153,158,155,154,223,140,151,144,136,146,144,155,158,147,157,147,144,156,148,146,144,155,158,147,210,139,150,139,147,154,140,151,144,136,146,144,155,158,147,210,155,150,158,147,144,152,137,140,138,150,210,155,150,158,147,144,152]);a.Imaging=a.Imaging;(function(c){c.UI=c.UI;(function(c){c.Dialogs=
{};(function(c){var f=a.Shared,d=a.Imaging.UI.UIElements,m=function(a,c,e,l){var g=m.prototype,k=m.superclass,h=b(0,113,11);l.className=null==l.className?h:h+l.className;a=new d.WebUiElementContainerJS(a,{cssClass:b(0,39,12)});c=new d.WebUiElementContainerJS(c,{cssClass:b(0,51,10)});e=new d.WebUiElementContainerJS(e,{cssClass:b(0,13,12)});e=new d.WebUiElementContainerJS([a,c,e],{cssClass:b(0,0,13)});e=new d.WebUiElementContainerJS([e],{cssClass:b(0,101,12)});e=new d.WebUiElementContainerJS([e],{cssClass:b(0,
76,5)});k.constructor.call(this,[e],l);this._22827=!1;g.set_IsEnabled=function(a){var b=this._5862;k.set_IsEnabled.call(this,a);b===this._5862||a||this.hide()};g.isVisible=function(){return this._22827?f.suf47(this._26169.childNodes[0],b(0,97,4)):k.isVisible.call(this)};g.render=function(a){var b=k.render.call(this,a);a.appendChild(b);this.hide();return b};g.show=function(){this._22827||this.init();var a=this._26169;a.className="";a.style.display=b(0,81,5);a=a.childNodes[0];a.className=b(0,61,15);
a.style.display=b(0,81,5)};g.hide=function(){if(this._22827){var a=this._26169.childNodes[0];a.className=b(0,25,10);a.style.display=b(0,35,4)}else k.hide.call(this)};g.init=function(){this._22827=!0}};f.extend(m,d.WebUiElementContainerJS);c.WebUiDialogJS=m})(c.Dialogs)})(c.UI)})(a.Imaging)})(Vintasoft);
