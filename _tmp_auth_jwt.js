/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 989:
/***/ (function(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(77810);
/* harmony import */ var react_dom_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(94140);
/* harmony import */ var _component_doclayout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(33237);



react_dom_client__WEBPACK_IMPORTED_MODULE_1__.createRoot(document.getElementById('root')).render(react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_doclayout__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A, null,
    react__WEBPACK_IMPORTED_MODULE_0__.createElement("div", { className: "markdown", "data-reactroot": "" },
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h1", { id: "Service-Account-\u8A8D\u8A3C-(JWT)" },
            "Service Account \u8A8D\u8A3C (JWT)",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#Service-Account-\u8A8D\u8A3C-(JWT)", id: "Service-Account-\u8A8D\u8A3C-(JWT)", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            "Service Account \u8A8D\u8A3C\u306F\u3001JSON Web Token (\u4EE5\u964D\u3001JWT) \u3092\u4F7F\u7528\u3057\u3066\u30A2\u30D7\u30EA\u5C02\u7528\u306E\u4EEE\u60F3\u7BA1\u7406\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u8A8D\u8A3C\u3092\u884C\u3044\u3001",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Access Token"),
            " \u3092\u767A\u884C\u3057\u3066 API \u3092\u5229\u7528\u3059\u308B\u65B9\u6CD5\u3067\u3059\u3002",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
            "Service Account \u8A8D\u8A3C (JWT) \u3092\u4F7F\u7528\u3057\u305F ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Access Token"),
            " \u306E\u767A\u884C\u306F\u3001\u4EE5\u4E0B\u306E\u6D41\u308C\u3067\u884C\u3044\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("ol", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                "\u30A2\u30D7\u30EA\u958B\u767A\u8005\u306F\u3001\u4E8B\u524D\u306B Developer Console \u3067\u30A2\u30D7\u30EA\u3092\u69CB\u6210\u3059\u308B\u3002\u30A2\u30D7\u30EA\u3067\u5FC5\u8981\u3068\u306A\u308B ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Scope"),
                " \u3092\u6307\u5B9A\u3057\u3001",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Service Account"),
                " \u3068 ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Private Key"),
                " \u3092\u767A\u884C\u3059\u308B\u3002"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                "\u30A2\u30D7\u30EA\u306F\u3001\u30A2\u30D7\u30EA\u306E ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Client Id"),
                " \u3068 ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Service Account"),
                " \u3092\u4F7F\u7528\u3057\u3066 JWT \u3092\u751F\u6210\u3059\u308B(",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://tools.ietf.org/html/rfc7519", target: "_blank" }, "RFC-7519"),
                ")"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                "\u30A2\u30D7\u30EA\u306F\u3001",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Private Key"),
                " \u3092\u4F7F\u7528\u3057\u3066 JWT \u3092\u30C7\u30B8\u30BF\u30EB\u7F72\u540D\u3059\u308B(",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://tools.ietf.org/html/rfc7515", target: "_blank" }, "RFC-7515"),
                ")"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                "\u30A2\u30D7\u30EA\u306F\u3001LINE WORKS \u306B ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Access Token"),
                " \u306E\u767A\u884C\u3092\u8981\u6C42\u3059\u308B(",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://tools.ietf.org/html/rfc7523", target: "_blank" }, "RFC-7523"),
                ")"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                "\u30A2\u30D7\u30EA\u306F\u3001Access Token \u306E\u6709\u52B9\u671F\u9650\u304C\u904E\u304E\u305F\u5834\u5408\u3001",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Refresh Token"),
                " \u3092\u4F7F\u7528\u3057\u3066 ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Access Token"),
                " \u306E\u518D\u767A\u884C\u3092 LINE WORKS \u306B\u8981\u6C42\u3059\u308B")),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", { id: "token-expiry" },
            "Access Token / Refresh Token \u306E\u6709\u52B9\u671F\u9650 ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#token-expiry", id: "token-expiry", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Access Token"),
            "\u3001",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Refresh Token"),
            " \u306B\u306F\u3001\u305D\u308C\u305E\u308C\u6709\u52B9\u671F\u9650\u304C\u8A2D\u3051\u3089\u308C\u3066\u3044\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "Access Token"),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                        "\u6709\u52B9\u671F\u9650\uFF1A ",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "1 \u6642\u9593"),
                        " \u307E\u305F\u306F ",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "24 \u6642\u9593")))),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "Refresh Token"),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                        "\u6709\u52B9\u671F\u9650\uFF1A ",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "90 \u65E5"))))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", { id: "service-account" },
            "Service Account \u306B\u3064\u3044\u3066 ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#service-account", id: "service-account", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            "LINE WORKS API \u3092\u5229\u7528\u3059\u308B\u306B\u306F\u30E6\u30FC\u30B6\u30FC\u307E\u305F\u306F ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Service Account"),
            " \u306B\u3088\u308B\u8A8D\u8A3C\u3092\u884C\u3046\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Service Account"),
            " \u3068\u306F\u3001\u30E6\u30FC\u30B6\u30FC\u306B\u3088\u308B\u8A8D\u8A3C\u3092\u884C\u308F\u305A\u306B LINE WORKS API \u3092\u5229\u7528\u3059\u308B\u305F\u3081\u306B\u7528\u610F\u3055\u308C\u305F\u4EEE\u60F3\u7684\u306A\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u3001\u4EE5\u4E0B\u306E\u7279\u5FB4\u304C\u3042\u308A\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
                    "1 \u3064\u306E\u30A2\u30D7\u30EA\u306B\u5BFE\u3057 1 \u3064\u306E ",
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Service Account"),
                    " \u306E\u307F\u767A\u884C\u3067\u304D\u307E\u3059")),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\u767A\u884C\u3068\u540C\u6642\u306B\u7BA1\u7406\u8005\u6A29\u9650\u304C\u4ED8\u4E0E\u3055\u308C\u3001\u7BA1\u7406\u8005\u306B\u30B5\u30FC\u30D3\u30B9\u901A\u77E5\u3055\u308C\u307E\u3059")),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\u767A\u884C\u5143\u306E\u30A2\u30D7\u30EA\u4EE5\u5916\u3067\u306F\u4F7F\u7528\u3067\u304D\u307E\u305B\u3093")),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\u30A2\u30D7\u30EA\u5C02\u7528\u306E\u4EEE\u60F3\u7BA1\u7406\u8005\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u3042\u308B\u305F\u3081\u8AB2\u91D1\u306E\u5BFE\u8C61\u306B\u306A\u308A\u307E\u305B\u3093")),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#prohibited-api", target: "_blank" }, "\u5229\u7528\u3067\u304D\u306A\u3044 API"),
                    " \u304C\u3042\u308A\u307E\u3059")),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
                    "Path \u30D1\u30E9\u30E1\u30FC\u30BF\u306E ",
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "{userId}"),
                    " \u306B\u5BFE\u3057\u3066\u3001",
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "me"),
                    " \u3092\u4F7F\u7528\u3067\u304D\u307E\u305B\u3093"))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            "\u7D44\u7E54\u9023\u643A\u3084 BOT \u306B\u3088\u308B\u30E1\u30C3\u30BB\u30FC\u30B8\u9001\u4FE1\u306A\u3069\u306E\u30A2\u30D7\u30EA\u3067\u306F\u3001",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Service Account"),
            " \u3092\u5229\u7528\u3057\u3066\u3001\u30E6\u30FC\u30B6\u30FC\u306B\u3088\u308B\u8A8D\u8A3C\u3092\u884C\u308F\u306A\u3044\u30A2\u30D7\u30EA\u3092\u69CB\u6210\u3067\u304D\u307E\u3059\u3002",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Service Account"),
            " \u306F\u3001Developer Console \u306E\u30A2\u30D7\u30EA\u8A2D\u5B9A\u3067\u767A\u884C\u3057\u307E\u3059\u3002",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
            "\u767A\u884C\u3057\u305F ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Service Account"),
            " \u306E\u60C5\u5831\u306F\u4EE5\u4E0B\u306E\u3088\u3046\u306B\u8868\u793A\u3055\u308C\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null, "\u59D3 : \"[SERVICE]\""),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null, "\u540D : \u30A2\u30D7\u30EA\u540D"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null, "ID : {\u767A\u884C\u3057\u305F Service Account}@domain")),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h2", { id: "preparation" },
            "\u4E8B\u524D\u6E96\u5099 ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#preparation", id: "preparation", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "Developer Console \u306B\u30A2\u30D7\u30EA\u3092\u767B\u9332\u3057\u3001\u4EE5\u4E0B\u306E\u30A2\u30D7\u30EA\u60C5\u5831\u3092\u6E96\u5099\u3057\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null, "Client ID"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null, "Client Secret"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null, "Service Account"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null, "Private Key")),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h2", { id: "jwt-flow" },
            "\u5229\u7528\u30D5\u30ED\u30FC ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#jwt-flow", id: "jwt-flow", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("img", { src: "/image/jp/api/authorization/auth_service_account.svg", alt: "auth_service_account" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h2", { id: "generate-jwt" },
            "JWT \u306E\u751F\u6210 ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#generate-jwt", id: "generate-jwt", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "JWT \u306F\u4EE5\u4E0B\u306E\u5F62\u5F0F\u3092\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", { className: "language-json" },
                "{Header BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9}.{JSON Claims Set BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9}.{signature BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9}",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\u4EE5\u4E0B\u306F\u5B9F\u969B\u306E JWT \u306E\u4F8B\u3067\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", null,
                "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                ".eyJpc3MiOiJaYnNPcTZ6anQwSWh0WlpucmMiLCJzdWIiOiIxd2FneC5zZXJ2aWNlYWNjb3VudEBleGFtcGxlLmNvbSIsImlhdCI6MTY4Mjg3MTgyNSwiZXhwIjoxNjgyODc1NDI1fQ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                ".aICZ8qvYFKSJT6VdrmEcs6siCHaCgFkqpVs5VALKhf98sZjguppp-bOy9MpNlNepfSF0IyrdG3JavHLUYBz1NEVVZJwEm39f7gODmnt-_kGfDo1YtOqnclP1gM8oiObF2AH2Eneh3XuyeVeZbKAZmp6I_ZOf8AGayVVui61CsDPbUIPZSKUnbW1-vlXboTlojxJhvHznpYSNanHSrg5Nht2VO5sOeclEgPqg3J8Y6XOT60u8Morv5wHUy8a0QyO0yWCT5OJdXeVj94qfDAM15a1Puw9PfQOPm7QhOarvCJ8cOSqo9PHluq9-KZ1WXmfxSo-_itTb8y2YRT3kd21maQ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", { id: "jwt-header" },
            "Header ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#jwt-header", id: "jwt-header", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            "Header \u306B ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "RSA SHA-256"),
            " \u30A2\u30EB\u30B4\u30EA\u30BA\u30E0 \"",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("em", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "RS256")),
            "\" \u3092\u660E\u793A\u3057\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", { className: "language-json" },
                "{ \"alg\": \"RS256\", \"typ\": \"JWT\" }",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\u3053\u306E\u5024\u3092 BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9\u3059\u308B\u3068\u4EE5\u4E0B\u306B\u306A\u308A\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", null,
                "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", { id: "jwt-json-claims-set" },
            "JSON Claims Set ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#jwt-json-claims-set", id: "jwt-json-claims-set", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "JSON Claims Set \u306F\u3001\u4EE5\u4E0B\u306E\u60C5\u5831\u3092\u542B\u3080 JSON \u5F62\u5F0F\u306E\u6587\u5B57\u5217\u3067\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("table", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("thead", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("th", null, "\u30D1\u30E9\u30E1\u30FC\u30BF"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("th", null, "\u8AAC\u660E"))),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("tbody", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "iss"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "\u30A2\u30D7\u30EA\u306E ",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Client ID"))),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "sub"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Service Account ID"))),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "iat"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "JWT \u751F\u6210\u65E5\u6642",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "UNIX \u6642\u9593\u3067\u6307\u5B9A(\u5358\u4F4D: sec)")),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "exp"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "JWT \u6E80\u4E86\u65E5\u6642",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "\u6700\u9577\u3067 60 \u5206\u5F8C\u307E\u3067\u6307\u5B9A\u53EF\u80FD",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "UNIX \u6642\u9593\u3067\u6307\u5B9A(\u5358\u4F4D: sec)")))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\u4F8B: \u4EE5\u4E0B\u306E\u6761\u4EF6\u306E\u5834\u5408"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null, "Client ID: ZbsOq6zjt0IhtZZnrc"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                "Service Account: ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("foo", null, "1wagx.serviceaccount"),
                "@example.com"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null, "JWT \u751F\u6210\u65E5\u6642: 2023-05-01 01:23:45"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null, "JWT \u6E80\u4E86\u65E5\u6642: 2023-05-01 02:23:45 (60 \u5206\u5F8C\u6E80\u4E86)")),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "JSON \u5F62\u5F0F\u3067\u306E\u8868\u793A"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", { className: "language-json" },
                "{",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, "  "),
                "\"iss\": \"ZbsOq6zjt0IhtZZnrc\",",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, "  "),
                "\"sub\": \"1wagx.serviceaccount@example.com\",",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, "  "),
                "\"iat\": 1682871825,",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, "  "),
                "\"exp\": 1682875425",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                "}",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\u3053\u306E\u5024\u3092 BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9\u3059\u308B\u3068\u3001\u4EE5\u4E0B\u306B\u306A\u308A\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", null,
                "eyJpc3MiOiJaYnNPcTZ6anQwSWh0WlpucmMiLCJzdWIiOiIxd2FneC5zZXJ2aWNlYWNjb3VudEBleGFtcGxlLmNvbSIsImlhdCI6MTY4Mjg3MTgyNSwiZXhwIjoxNjgyODc1NDI1fQ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", { id: "jwt-signature" },
            "JWT \u30C7\u30B8\u30BF\u30EB\u7F72\u540D (Signature) ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#jwt-signature", id: "jwt-signature", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            "\u30C7\u30B8\u30BF\u30EB\u7F72\u540D\u306F JWS (JSON Web Signature ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://tools.ietf.org/html/rfc7515", target: "_blank" }, "RFC-7515"),
            ") \u898F\u7D04\u306B\u5F93\u3044\u3001\u5148\u306B\u751F\u6210\u3057\u305F JWT header \u3068 body \u306E byte array \u3092\u3001Developer Console \u3067\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u3057\u305F Private Key \u3092\u7528\u3044\u3066 RSA SHA-256 \u30A2\u30EB\u30B4\u30EA\u30BA\u30E0 (Header \u3067\u5B9A\u3081\u305F \"",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("em", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "RS256")),
            "\") \u3067\u7F72\u540D\u3057\u3001BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9\u3057\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            "Header \u3068 Claims Set \u3092 \"",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("em", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, ".")),
            "\" \u3067\u7D44\u307F\u5408\u308F\u305B\u308B\u3068 ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "{header BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9}.{JSON Claims Set BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9}"),
            " \u306F\u4EE5\u4E0B\u306B\u306A\u308A\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", null,
                "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJaYnNPcTZ6anQwSWh0WlpucmMiLCJzdWIiOiIxd2FneC5zZXJ2aWNlYWNjb3VudEBleGFtcGxlLmNvbSIsImlhdCI6MTY4Mjg3MTgyNSwiZXhwIjoxNjgyODc1NDI1fQ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            "\u751F\u6210\u3057\u305F ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "{Header BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9}.{JSON Claims Set BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9}"),
            " \u3092\u30C7\u30B8\u30BF\u30EB\u7F72\u540D\u3057\u3066\u3001BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9\u3059\u308B\u3068 ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "{Signature BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9}"),
            " \u306F\u4EE5\u4E0B\u306B\u306A\u308A\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", null,
                "RqOaErJWZc_ZGijL5r0a892NnQL_zbkgchThW3j4pzG_qMqtOgex2odEs8JFsPfQ2c8_2BkaUMckNIN3C27t2RsbppJYl3nQr9w2Jb6x9LJR1Ym3pJVlpRvarracRwa00OgVc0mZ5dkn3B4I55GpKjZ3oOLfW7Xw0OAj8fEYCmWJmma3xQQrScJAUqN-jTZ7T3C6-ieVo3IhTRopzS5cru3ilQWekQ6-fRTPr8W4EV9B0u8wXhCxT90mlAYtebPvyovpPTNhi8Oq8rO_gVnpSMNkDtZ6p6OpC7_XG7ZcjUo7KRCxyPLe2-TmeWtV0jL5vqsjnlAznKtw5mPGOwpjVQ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            "\u6700\u7D42\u7684\u306B\u5B8C\u6210\u3057\u305F JWT ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "{Header BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9}.{JSON Claims Set BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9}.{Signature BASE64 URL \u30A8\u30F3\u30B3\u30FC\u30C9}"),
            " \u306F\u4EE5\u4E0B\u306B\u306A\u308A\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", null,
                "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJaYnNPcTZ6anQwSWh0WlpucmMiLCJzdWIiOiIxd2FneC5zZXJ2aWNlYWNjb3VudEBleGFtcGxlLmNvbSIsImlhdCI6MTY4Mjg3MTgyNSwiZXhwIjoxNjgyODc1NDI1fQ.RqOaErJWZc_ZGijL5r0a892NnQL_zbkgchThW3j4pzG_qMqtOgex2odEs8JFsPfQ2c8_2BkaUMckNIN3C27t2RsbppJYl3nQr9w2Jb6x9LJR1Ym3pJVlpRvarracRwa00OgVc0mZ5dkn3B4I55GpKjZ3oOLfW7Xw0OAj8fEYCmWJmma3xQQrScJAUqN-jTZ7T3C6-ieVo3IhTRopzS5cru3ilQWekQ6-fRTPr8W4EV9B0u8wXhCxT90mlAYtebPvyovpPTNhi8Oq8rO_gVnpSMNkDtZ6p6OpC7_XG7ZcjUo7KRCxyPLe2-TmeWtV0jL5vqsjnlAznKtw5mPGOwpjVQ",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            "\u4EE5\u964D\u306E Token \u30EA\u30AF\u30A8\u30B9\u30C8\u3067\u306F\u3001\u751F\u6210\u3057\u305F JWT \u3092 ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "assertion"),
            " \u30D1\u30E9\u30E1\u30FC\u30BF\u3068\u3057\u3066\u6E21\u3057\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("blockquote", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\u53C2\u8003"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null, "JWT \u306E\u751F\u6210\u306B\u306F\u3001\u30E9\u30A4\u30D6\u30E9\u30EA\u306E\u5229\u7528\u3092\u63A8\u5968\u3057\u307E\u3059\u3002"),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                    "\u4E00\u4F8B\u3068\u3057\u3066\u3001Java \u306E\u5834\u5408\u306B\u306F\u4EE5\u4E0B\u306E\u30E9\u30A4\u30D6\u30E9\u30EA\u3092\u5229\u7528\u3067\u304D\u307E\u3059\u3002",
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://github.com/jwtk/jjwt", target: "_blank" }, "https://github.com/jwtk/jjwt")),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://github.com/auth0/java-jwt", target: "_blank" }, "https://github.com/auth0/java-jwt")),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://bitbucket.org/b_c/jose4j/wiki/Home", target: "_blank" }, "https://bitbucket.org/b_c/jose4j/wiki/Home")),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "https://bitbucket.org/connect2id/nimbus-jose-jwt/wiki/Home", target: "_blank" }, "https://bitbucket.org/connect2id/nimbus-jose-jwt/wiki/Home")))))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h2", { id: "issue-access-token" },
            "Access Token \u306E\u767A\u884C ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#issue-access-token", id: "issue-access-token", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", { id: "issue-access-token-request-url" },
            "Request URL ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#issue-access-token-request-url", id: "issue-access-token-request-url", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", null,
                "POST https://auth.worksmobile.com/oauth2/v2.0/token",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", { id: "issue-access-token-request-header" },
            "Request Headers ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#issue-access-token-request-header", id: "issue-access-token-request-header", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", null,
                "Content-Type: application/x-www-form-urlencoded",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h4", { id: "issue-access-token-request-body" },
            "Request Body ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#issue-access-token-request-body", id: "issue-access-token-request-body", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\u4EE5\u4E0B\u306E\u9805\u76EE\u3092 POST \u3067\u9001\u4FE1\u3059\u308B\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("table", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("thead", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("th", null, "\u30D1\u30E9\u30E1\u30FC\u30BF"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("th", null, "\u30BF\u30A4\u30D7"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("th", null, "\u8AAC\u660E"))),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("tbody", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "assertion"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "String"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "JWT \u306E\u5024",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "required"))),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "grant_type"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "String"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "\"",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("em", null,
                            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "urn:ietf:params:oauth:grant-type:jwt-bearer")),
                        "\" (\u56FA\u5B9A)",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "required"))),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "client_id"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "String"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "\u30A2\u30D7\u30EA\u306E ",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Client ID"),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "required"))),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "client_secret"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "String"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "\u30A2\u30D7\u30EA\u306E ",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Client Secret"),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "required"))),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "scope"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "String"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "\u5229\u7528\u3059\u308B ",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Scope"),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "\u8907\u6570\u306E Scope \u3092\u6307\u5B9A\u3059\u308B\u5834\u5408\u306B\u306F\u534A\u89D2\u30B9\u30DA\u30FC\u30B9\u3067\u533A\u5207\u308B",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "required"))))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", { id: "issue-access-token-request-example" },
            "Request Example ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#issue-access-token-request-example", id: "issue-access-token-request-example", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", { className: "language-shell" },
                "curl --location --request POST 'https://auth.worksmobile.com/oauth2/v2.0/token' \\",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                "--header 'Content-Type: application/x-www-form-urlencoded' \\",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                "--data-urlencode 'assertion=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJaYnNPcTZ6anQwSWh0WlpucmMiLCJzdWIiOiIxd2FneC5zZXJ2aWNlYWNjb3VudEBleGFtcGxlLmNvbSIsImlhdCI6MTY4Mjg3MTgyNSwiZXhwIjoxNjgyODc1NDI1fQ.RqOaErJWZc_ZGijL5r0a892NnQL_zbkgchThW3j4pzG_qMqtOgex2odEs8JFsPfQ2c8_2BkaUMckNIN3C27t2RsbppJYl3nQr9w2Jb6x9LJR1Ym3pJVlpRvarracRwa00OgVc0mZ5dkn3B4I55GpKjZ3oOLfW7Xw0OAj8fEYCmWJmma3xQQrScJAUqN-jTZ7T3C6-ieVo3IhTRopzS5cru3ilQWekQ6-fRTPr8W4EV9B0u8wXhCxT90mlAYtebPvyovpPTNhi8Oq8rO_gVnpSMNkDtZ6p6OpC7_XG7ZcjUo7KRCxyPLe2-TmeWtV0jL5vqsjnlAznKtw5mPGOwpjVQ' \\",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                "--data-urlencode 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer' \\",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                "--data-urlencode 'client_id=ZbsOq6zjt0IhtZZnrc' \\",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                "--data-urlencode 'client_secret=oRm3M_nBg6' \\",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                "--data-urlencode 'scope=bot user.read'",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", { id: "issue-access-token-response-body" },
            "Response Body (JSON) ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#issue-access-token-response-body", id: "issue-access-token-response-body", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("table", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("thead", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("th", null, "\u30D1\u30E9\u30E1\u30FC\u30BF"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("th", null, "\u30BF\u30A4\u30D7"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("th", null, "\u8AAC\u660E"))),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("tbody", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "access_token"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "String"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Access Token"))),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "refresh_token"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "String"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Refresh Token"))),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "token_type"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "String"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "\"",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("em", null,
                            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Bearer")),
                        "\" (\u56FA\u5B9A)")),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "expires_in"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "String"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Access Token"),
                        " \u306E\u6709\u52B9\u671F\u9650",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "\u6709\u52B9\u671F\u9650\u306F\u3001",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "/jp/console/openapi/v2/app/list/view", target: "_blank" }, "Developer Console > API > ClientApp"),
                        " \u306E [\u30C8\u30FC\u30AF\u30F3\u8A2D\u5B9A > Access Token\u306E\u6709\u52B9\u671F\u9650] \u306E\u8A2D\u5B9A\u306B\u5F93\u3046\u3002",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "\u30FB1 hour (3600 \u79D2)",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "\u30FB24 hours (86400 \u79D2)",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "\u8A2D\u5B9A\u3055\u308C\u305F\u6709\u52B9\u671F\u9650\u304C\u7D4C\u904E\u3059\u308B\u3068\u3001\u81EA\u52D5\u7684\u306B\u6E80\u4E86\u3059\u308B\u3002")),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "scope"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "String"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Access Token"),
                        " \u3067\u5229\u7528\u3067\u304D\u308B ",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Scope"))))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h3", { id: "issue-access-token-response-example" },
            "Response Example",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#issue-access-token-response-example", id: "issue-access-token-response-example", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", { className: "language-json" },
                "{",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, "  "),
                "\"access_token\": \"jp1AAABFNKyxc7xsVRQVKrTNFchiiMkQrfJMDM6whobYxfbO4fsF23mvuxRvSuMY57DG4uPI/NI4eNMSt8sroqpqFhe3HemLI3OvCar5FFfOQdqUBgqFA/MaHZVXHqsNJgoX7KaGwDTum+zhEyfwjGSrrJZfSoRpTHHrwny4F4UDEA1Lep3dVUUUKAIQHcq0TwCjiWkMnJAXMEFFfbdVzH3FCv+kpb2OH1NbYzL376fXLh3vMUlyRBXPTf3Lv0bK5NsvjR3BNMR3GSvVzjM59lR5ctBK8PvtTdmaHbVGXzJBHv+S3mp1UuD0szSuxCsWUrdCS7/PiWbQwM4++k+WM/bta5EB9v9s9YQGlyklE3fqhnYLGx/9jWanFgrvptCambOW8lv5A==\",",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, "  "),
                "\"refresh_token\": \"jp1AAAAVq8kTeVPKkD11iLMP1mTqzYOd2T/r2x6QoBM2P3D8X6FfDi9wG5Hepsmh/LVpo3n3d/jcP/rnhtEw1VOpU4MJnxHVzu1x5VhKRmG/o63HERu2bnMtFHQVsjhljcf5fpm+Q==\",",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, "  "),
                "\"scope\": \"bot user.read\",",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, "  "),
                "\"token_type\": \"Bearer\",",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", null, "  "),
                "\"expires_in\": 86400",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                "}",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "Service Account \u3092\u5229\u7528\u3057\u305F JWT \u8A8D\u8A3C\u306B\u5931\u6557\u3059\u308B\u3068\u30A8\u30E9\u30FC\u3092\u8FD4\u3057\u307E\u3059\u3002\u30A8\u30E9\u30FC\u5185\u5BB9\u306F\u30EC\u30B9\u30DD\u30F3\u30B9\u30DC\u30C7\u30A3\u3067\u78BA\u8A8D\u3067\u304D\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("blockquote", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\u6CE8\u610F"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                    "Token \u3068\u5171\u306B\u3001Access Token \u306E\u6709\u52B9\u671F\u9650\u3068 ",
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Refresh Token"),
                    " \u3092\u4FDD\u5B58\u3059\u308B\u3053\u3068\u3092\u63A8\u5968\u3057\u307E\u3059\u3002"),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                    "API \u306E\u5229\u7528\u6642\u306B Access Token \u306E\u6709\u52B9\u671F\u9650\u3092\u78BA\u8A8D\u3057\u3001\u6709\u52B9\u671F\u9650\u304C\u7D42\u4E86\u3057\u3066\u3044\u308B\u5834\u5408\u306B\u306F ",
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Refresh Token"),
                    " \u3092\u7528\u3044\u3066 ",
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Access Token"),
                    " \u3092\u518D\u767A\u884C\u3067\u304D\u307E\u3059\u3002"))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h2", { id: "refresh-access-token" },
            "Access Token \u306E\u518D\u767A\u884C ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#refresh-access-token", id: "refresh-access-token", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "/jp/docs/auth-oauth#refresh-access-token", target: "_blank" }, "User Account \u8A8D\u8A3C (OAuth) > Access Token \u306E\u518D\u767A\u884C"),
            " \u3092\u53C2\u7167\u3057\u3066\u304F\u3060\u3055\u3044\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h2", { id: "revoke-token" },
            "Token \u306E\u7121\u52B9\u5316 ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#revoke-token", id: "revoke-token", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "/jp/docs/auth-oauth#revoke-token", target: "_blank" }, "User Account \u8A8D\u8A3C (OAuth) > Token \u306E\u7121\u52B9\u5316"),
            " \u3092\u53C2\u7167\u3057\u3066\u304F\u3060\u3055\u3044\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h2", { id: "how-to-use-access-token" },
            "Access Token \u306E\u4F7F\u7528 ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#how-to-use-access-token", id: "how-to-use-access-token", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null,
            "\u767A\u884C\u3055\u308C\u305F Access Token\u306F\u3001\u8A8D\u8A3C\u30B9\u30AD\u30FC\u30E0 ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Bearer"),
            " \u3068\u7D44\u307F\u5408\u308F\u305B\u3066 ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Authorization"),
            " HTTP Request Header \u306B\u6307\u5B9A\u3057\u3001API \u3092\u547C\u3073\u51FA\u3057\u307E\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("blockquote", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\u6CE8\u610F"),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("ul", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("li", null,
                    "Authorization \u30BF\u30A4\u30D7\u306B ",
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Bearer"),
                    " \u3092\u660E\u793A\u3057\u3001",
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Bearer"),
                    " \u3068 ",
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("strong", null, "Token"),
                    " \u3092 1 \u3064\u306E\u534A\u89D2\u30B9\u30DA\u30FC\u30B9\u3067\u3064\u306A\u304E\u307E\u3059\u3002"))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("pre", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("button", { className: "code-copy" }),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("code", { className: "language-java" },
                "PostMethod method = new PostMethod(url);",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                "method.setRequestHeader(\"Authorization\", \"Bearer AAAA5IdUiCj5emZowcf49VRu7qbb548g6aGE\");",
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null))),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("h2", { id: "prohibited-api" },
            "Service Account \u3067\u306F\u5229\u7528\u3067\u304D\u306A\u3044 API ",
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("a", { href: "#prohibited-api", id: "prohibited-api", className: "heading_link" })),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("p", null, "\u91CD\u8981\u306A\u30E6\u30FC\u30B6\u30FC\u60C5\u5831\u3092\u53D6\u308A\u6271\u3046 API \u306A\u3069\u3001\u4E00\u90E8\u306E API \u306F\u3001Service Account \u8A8D\u8A3C\u3067\u767A\u884C\u3055\u308C\u305F Access Token \u3067\u306F\u547C\u3073\u51FA\u3059\u3053\u3068\u304C\u3067\u304D\u307E\u305B\u3093\u3002Service Account \u8A8D\u8A3C\u3067\u306F\u5229\u7528\u3067\u304D\u306A\u3044 API \u306F\u4EE5\u4E0B\u306E\u3068\u304A\u308A\u3067\u3059\u3002"),
        react__WEBPACK_IMPORTED_MODULE_0__.createElement("table", null,
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("thead", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("th", null, "Scopes"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("th", null, "APIs"))),
            react__WEBPACK_IMPORTED_MODULE_0__.createElement("tbody", null,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "group.note",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "group.note.read"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "/groups/{groupId}/note*")),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "mail",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "mail.read"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "/users/{userId}/mail*",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "\u305F\u3060\u3057\u3001\u4EE5\u4E0B\u306E API \u306F\u5229\u7528\u53EF\u80FD",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "\u2022 /users/{userId}/mail/migration*",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "\u2022 /users/{userId}/mail/settings/forwarding")),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "file",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "file.read"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "/users/{userId}/drive*",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "/sharedrives*")),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "file",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "file.read",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "group.folder",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "group.folder.read"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "/groups/{groupId}/folder*")),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "task",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "task.read"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "/tasks*",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "/users/{userId}/tasks*",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "/users/{userId}/task-categories")),
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("tr", null,
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null,
                        "form",
                        react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null),
                        "form.read"),
                    react__WEBPACK_IMPORTED_MODULE_0__.createElement("td", null, "/forms*")))))));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	!function() {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = function(result, chunkIds, fn, priority) {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var chunkIds = deferred[i][0];
/******/ 				var fn = deferred[i][1];
/******/ 				var priority = deferred[i][2];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every(function(key) { return __webpack_require__.O[key](chunkIds[j]); })) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	!function() {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			90635: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = function(chunkId) { return installedChunks[chunkId] === 0; };
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = function(parentChunkLoadingFunction, data) {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 			var runtime = data[2];
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some(function(id) { return installedChunks[id] !== 0; })) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkdeveloper"] = self["webpackChunkdeveloper"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	__webpack_require__.O(undefined, [18096,50008,33237], function() { return __webpack_require__(74270); })
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [18096,50008,33237], function() { return __webpack_require__(989); })
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
