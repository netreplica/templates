## Define the output format

> This step is required only if you're creating a new set of templates for a new output format.

If you intend to create a new output format, create a subfolder for it under the `templates` directory. For example, `myformat` for you special format:

```Shell
mkdir myformat
```

To make the new output format available to nrx, an entry describing basic properties of the format must be added to [`formats.yaml`](formats.yaml) file. Provide the following parameters:

```Yaml
type: formats_map
version: v1
formats:
  myformat:
    description: free-form
    file_format: yaml, json or custom
    file_extension: extension to add to the output file name
    startup_config_mode: file, inline on none – if and how the format supports startup configuration for the devices
```
