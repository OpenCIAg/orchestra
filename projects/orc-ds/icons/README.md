# Orchestra Material Symbols

This secondary entry point exposes the complete Material Symbols Rounded
catalog available when the package was generated. `ORC_MATERIAL_SYMBOLS`
contains the Google metadata used by the docs search and
`ORC_MATERIAL_SYMBOL_CATALOG` provides name-based lookup.

`orc-icon` renders the name as a Google Material Symbols ligature. The icon
font is loaded automatically from Google Fonts by the component stylesheet, so
consumers do not need to add a stylesheet to their application entry point.
The network request remains a runtime dependency: applications must allow
`fonts.googleapis.com` and `fonts.gstatic.com` in their CSP and provide network
access when icons are rendered.
