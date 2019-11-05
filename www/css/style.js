import React, {StyleSheet, Dimensions, PixelRatio} from "react-native";
const {width, height, scale} = Dimensions.get("window"),
    vw = width / 100,
    vh = height / 100,
    vmin = Math.min(vw, vh),
    vmax = Math.max(vw, vh);

export default StyleSheet.create({
    "button-float": {
        "background": "#387ef5 !important",
        "color": "white !important",
        "zIndex": "12 !important",
        "position": "fixed !important",
        "display": "block",
        "bottom": "10px !important",
        "right": "10px !important",
        "borderRadius": "50% !important",
        "boxShadow": "0 2px 5px 0 rgba(0, 0, 0, 0.26) !important",
        "WebkitTransform": "translate3d(0, 0, 0) !important",
        "transform": "translate3d(0, 0, 0) !important",
        "WebkitTransition": "0.2s linear !important",
        "transition": "0.2s linear !important",
        "WebkitTransitionProperty": "-webkit-transform, all !important",
        "transitionProperty": "transform, all !important"
    },
    "button-float:hover": {
        "WebkitTransform": "translate3d(0, -1px, 0)  !important",
        "transform": "translate3d(0, -1px, 0) !important",
        "boxShadow": "0 4px 8px 0 rgba(0, 0, 0, 0.4) !important",
        "background": "darken(#387ef5, 10%) !important"
    },
    "item-select-p": {
        "position": "relative"
    },
    "item-select-p select": {
        "WebkitAppearance": "none",
        "MozAppearance": "none",
        "appearance": "none",
        "position": "absolute",
        "top": 0,
        "bottom": 0,
        "left": 0,
        "paddingTop": 0,
        "paddingRight": 48,
        "paddingBottom": 0,
        "paddingLeft": 16,
        "maxWidth": "100%",
        "border": "none",
        "background": "#fff",
        "color": "#333",
        "textIndent": 0.01,
        "textOverflow": "''",
        "whiteSpace": "nowrap",
        "fontSize": 14,
        "cursor": "pointer",
        "direction": "rtl"
    },
    "item-select-p select::-ms-expand": {
        "display": "none"
    },
    "item-select-p option": {
        "direction": "ltr"
    },
    "item-select-p:after": {
        "position": "absolute",
        "top": "50%",
        "right": 16,
        "marginTop": -3,
        "width": 0,
        "height": 0,
        "borderTop": "5px solid",
        "borderRight": "5px solid transparent",
        "borderLeft": "5px solid transparent",
        "color": "#999",
        "content": "",
        "pointerEvents": "none"
    },
    "item-select-pitem-light select": {
        "background": "#fff",
        "color": "#444"
    },
    "item-select-pitem-stable select": {
        "background": "#f8f8f8",
        "color": "#444"
    },
    "item-select-pitem-stable:after": {
        "color": "#666666"
    },
    "item-select-pitem-stable input-label": {
        "color": "#666666"
    },
    "item-select-pitem-positive select": {
        "background": "#387ef5",
        "color": "#fff"
    },
    "item-select-pitem-positive:after": {
        "color": "#fff"
    },
    "item-select-pitem-positive input-label": {
        "color": "#fff"
    },
    "item-select-pitem-calm select": {
        "background": "#11c1f3",
        "color": "#fff"
    },
    "item-select-pitem-calm:after": {
        "color": "#fff"
    },
    "item-select-pitem-calm input-label": {
        "color": "#fff"
    },
    "item-select-pitem-assertive select": {
        "background": "#ef473a",
        "color": "#fff"
    },
    "item-select-pitem-assertive:after": {
        "color": "#fff"
    },
    "item-select-pitem-assertive input-label": {
        "color": "#fff"
    },
    "item-select-pitem-balanced select": {
        "background": "#33cd5f",
        "color": "#fff"
    },
    "item-select-pitem-balanced:after": {
        "color": "#fff"
    },
    "item-select-pitem-balanced input-label": {
        "color": "#fff"
    },
    "item-select-pitem-energized select": {
        "background": "#ffc900",
        "color": "#fff"
    },
    "item-select-pitem-energized:after": {
        "color": "#fff"
    },
    "item-select-pitem-energized input-label": {
        "color": "#fff"
    },
    "item-select-pitem-royal select": {
        "background": "#886aea",
        "color": "#fff"
    },
    "item-select-pitem-royal:after": {
        "color": "#fff"
    },
    "item-select-pitem-royal input-label": {
        "color": "#fff"
    },
    "item-select-pitem-dark select": {
        "background": "#444",
        "color": "#fff"
    },
    "item-select-pitem-dark:after": {
        "color": "#fff"
    },
    "item-select-pitem-dark input-label": {
        "color": "#fff"
    },
    "image-list-thumb": {
        "paddingTop": 2,
        "paddingRight": 2,
        "paddingBottom": 2,
        "paddingLeft": 2,
        "height": 150
    },
    "myimage-modal": {
        "width": "100% !important",
        "height": "100%",
        "top": "0 !important",
        "left": "0 !important"
    },
    "mytransparent": {
        "background": "rgba(0,0,0,0.7)"
    },
    "myimage": {
        "width": "100%",
        "height": 600,
        "backgroundSize": "contain",
        "backgroundRepeat": "no-repeat",
        "backgroundPosition": "center, center"
    },
    "back_marco": {
        "backgroundColor": "#000"
    },
    "back_observado": {
        "backgroundColor": "#F3FDDA"
    },
    "back_progreso": {
        "backgroundColor": "#E2F4FD"
    },
    "header_menu": {
        "width": "100%",
        "minHeight": 160,
        "display": "block"
    },
    "text-center": {
        "textAlign": "center"
    },
    "pull-right": {
        "float": "right"
    }
});