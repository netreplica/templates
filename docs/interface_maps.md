## Create a template under `interface_maps`

> This section needs updates to reflect the use of the `platform_map.yaml` file

> Most likely, the kind you're adding the template for doesn't support interface mapping. Proceed with this step only if you know that it does.

Some network operating systems, [Arista cEOS](https://containerlab.dev/manual/kinds/ceos/#user-defined-interface-mapping) being a prime example, have a mechanism to map emulated interface names created by the engines like Containerlab to interface names used by the NOS. To support such mechanism, `nrx` can render a template from the `interface_maps` directory, if it finds a file for the node kind in that directory. See [`ceos.j2`](clab/interface_maps/ceos.j2) as an example. When rendering, `nrx` will pass a dictionary variable `map` with:
* `key` – original interface name exported from NetBox
* `value` – a dictionary with
   * `name` – name of the emulated interface name as rendered via `interface_names` template
   * `index` - position of the interface in the list of exported interfaces for this node, sorted by name

