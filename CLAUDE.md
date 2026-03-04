This repository holds jinja2 templates for [nrx](https://github.com/netreplica/nrx) tool.

When testing, prefer exporting data from netbox into `cyjs` format first, and then to test individual templates, import from `cyjs`. Only re-export from netbox when data in previously exported `cyjs` file is expected to be outdated.

Extract generic parts from the core j2 templates into separate files and use includes. We want the topology.j2 and default.j2 to look small and easy to understand. For the files that will be included, if there is no jinja2 code in them, use extensions that match the content, e.g. .html for html snippets, .css for css snippets, etc. For the files that contain jinja2 code, use .j2 extension.