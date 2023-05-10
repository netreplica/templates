[![Discord](https://img.shields.io/discord/1075106069862416525?label=discord)](https://discord.gg/M2SkgSdKht)

# Netreplica Templates to build Emulated Network Topologies

We created this repository as a collection of templates for [netreplica nrx](https://github.com/netreplica/nrx/blob/main/README.md) software. It might be useful outside of **nrx** for any other effort to automate creation of software network labs.

This repository provides a set of such templates as a starting point. You're welcome to clone and adopt to your needs. If you'd like to contribute back, it would be greatly appreciated.

This project is in a proof-of-concept phase. We're experimenting with the best ways to automate software network lab orchestration. If you have any feedback, questions or suggestions, please reach out to us via the Netreplica Discord server linked above, [#netreplica](https://netdev-community.slack.com/archives/C054GKBC4LB) channel in NetDev Community on Slack, or open a github issue in this repository.

# Supported Network Emulation Engines

* [Containerlab](https://containerlab.dev/)
* [Cisco Modeling Labs](https://developer.cisco.com/modeling-labs/)

# What is included

| Platform                 | Containerlab                                              | CML                                                | Interface Mapping                                     |
| --------------           | ------------                                              | --------                                           |  --------                                             |
| Arista EOS               | [`ceos`             ](clab/kinds/ceos.j2)                 | `no`                                               | [Interface Map](interface_maps/ceos.j2)               |
| Cisco CSR1000v           | [`vr-cisco_csr1000v`](clab/kinds/vr-cisco_csr1000v.j2)    | `no`                                               | Not supported                                         |
| Cisco IOSv               | `no`                                                      | [`iosv`                  ](cml/kinds/iosv.j2)      | [CML Node Template](cml/kinds/iosv.j2)                |
| Cisco IOSvL2             | `no`                                                      | [`iosvl2`                ](cml/kinds/iosvl2.j2)    | [CML Node Template](cml/kinds/iosvl2.j2)              |
| Cisco NX-OSv9000         | `no`                                                      | [`nxosv9000`             ](cml/kinds/nxosv9000.j2) | [CML Node Template](cml/kinds/nxosv9000.j2)           |
| Linux                    | [`linux`            ](clab/kinds/linux.j2)                | `no`                                               | Not supported                                         |
| [RARE/freeRtr](http://docs.freertr.org/) | [`rare`             ](clab/kinds/rare.j2)                 | `no`                                               | Not supported                                         |
| Nokia SR-Linux           | [`srl`              ](clab/kinds/srl.j2)                  | `no`                                               | [Clab Interface Naming](clab/interface_names/srl.j2)  |
| SONiC                    | [`sonic-vs`         ](clab/kinds/sonic-vs.j2)             | `no`                                               | Not supported                                         |
| Ubuntu                   | `ubuntu` -> [`linux`](clab/kinds/linux.j2)                | [`ubuntu`                ](cml/kinds/ubuntu.j2)    | Not supported                                         |
| Unknown                  | `unknown` -> [`linux`](clab/kinds/linux.j2)               | `unknown` -> [`iosvl2`   ](cml/kinds/iosvl2.j2)    | Not supported                                         |

# Template naming convention

Containerlab artifacts:

* `clab/topology.j2`: template for the final Containerlab topology file.
* `clab/kinds/<kind>.j2`: templates for individual Containerlab node entries in the topology file.
* `clab/interface_names/<kind>.j2`: templates for generating emulated interface names used by the NOS `kind` in Containerlab.

Cisco Modeling Labs artifacts:

* `cml/topology.j2`: template for the final CML topology file.
* `cml/kinds/<kind>.j2`: templates for individual CML node entries in the topology file.
* `cml/interface_names/<kind>.j2`: templates for generating emulated interface names used by the NOS `kind` in CML.

NOS-specific artifacts:

* `interface_maps/<kind>.j2`: templates for mappings between real interface names and emulated interface names used by the NOS `kind`. Not all `kinds` support such mappings.

To customize the way a topology file should be generated, change these templates as needed. For example, you might want to modify `image` values depending on the `kind`. You can also add new templates, if the platforms you have are not covered by the provided set of templates.

# How to add a new template

## Clone the repository

Suppose you want to add a set of templates for a new node kind. The first step is to clone this repository:

```Shell
git clone https://github.com/netreplica/templates.git
```

> Note, if you would like to contribute your templates back to the community, please [fork](https://github.com/netreplica/templates/fork) the repository first and then clone the fork instead.

As a practical example, let's create templates for Containerlab `sonic-vs` kind. This kind represents [SONiC](https://sonic-net.github.io/SONiC/) open-source NOS. There is a [Docker image for SONiC](https://hub.docker.com/r/netreplica/docker-sonic-vs) hosted under [Netrepica Docker Hub](https://hub.docker.com/u/netreplica) using an image tag `netreplica/docker-sonic-vs`, and this is what we are going to use.

As a next step, let's create a new development branch, for example `new-clab-kind-sonic-vs`:

```Shell
cd templates
git checkout -b new-clab-kind-sonic-vs
```

## Create a template under `kinds`

Now, we need to create a template called `sonic-vs.j2` under `clab/kinds` directory:
* `nrx` will pass the name of the node to the template as `name` variable
* According to [documentation](https://containerlab.dev/manual/kinds/sonic-vs/), we should use `kind: sonic-vs` to describe SONiC nodes
* As mentioned before, the Docker tag for the image will be `netreplica/docker-sonic-vs:latest`
* For better visualization with [Graphite](https://github.com/netreplica/graphite), we will use a [custom label](https://github.com/netreplica/graphite/blob/main/docs/CONTAINERLAB.md#changing-visualization-icons) `graph-icon: switch`
* Including [`clab/labels.j2`](clab/labels.j2) will add some common labels, like `graph-level` to [visually align](https://github.com/netreplica/graphite/blob/main/docs/CONTAINERLAB.md#improve-visualization-via-custom-labels-in-a-containerlab-yaml-file) nodes in Graphite
* Another variable `nrx` will pass to the template is `interface_map` if [such a template](#create-a-template-under-interface_maps) was rendered for this node

```Yaml
cat > clab/kinds/sonic-vs.j2 << EOF
        {{ name }}:
            kind: sonic-vs
            image: netreplica/docker-sonic-vs:latest
            labels:
                graph-icon: switch
                {% include 'clab/labels.j2' %}
EOF
```

## Create a template under `interface_names`

The next step is to create another template – for interface naming. Some Containerlab node kinds, like `srl`, use special naming conventions for interfaces. In case of `sonic-vs`, the [interface naming convention](https://containerlab.dev/manual/kinds/sonic-vs/#interfaces-mapping) uses default linux-based interface names. As there is already a [`default.j2`](clab/interface_names/default.j2) template for this, all we need is to create a symbolic link to it using `sonic-vs.j2` file name:

```Shell
ln -s default.j2 clab/interface_names/sonic-vs.j2
```

If the interface naming convention for the kind you are adding follows different rules, you will need to create a custom template for that kind. See [`srl.j2`](clab/interface_names/srl.j2) as an example. `nrx` passed the following variables to the interface naming templates you can leverage:
* `interface` – original interface name exported from NetBox
* `index` – position of the interface in the list of exported interfaces for this node, sorted by name

> It is possible that some interface naming conventions cannot be created using current set of variables. Consider creating a [Feature Request](https://github.com/netreplica/nrx/issues/new) for `nrx` to support such a kind.

## Create a template under `interface_maps`

Some network operating systems, [Arista cEOS](https://containerlab.dev/manual/kinds/ceos/#user-defined-interface-mapping) being a prime example, have a mechanism to map emulated interface names created by the engines like Containerlab to interface names used by the NOS. To support such mechanism, `nrx` can render a template from the `interface_maps` directory, if it finds a file for the node kind in that directory. See [`ceos.j2`](interface_maps/ceos.j2) as an example. When rendering, `nrx` will pass a dictionary variable `map` with:
* `key` – original interface name exported from NetBox
* `value` – a dictionary with
   * `name` – name of the emulated interface name as rendered via `interface_names` template
   * `index` - position of the interface in the list of exported interfaces for this node, sorted by name

## Make symbolic links using NetBox `platform.slug`

Now that you created the template files, check relevant Device records in NetBox – specifically, what Platform is used in their configuration. If no Platform is configured currently, create a Platform record that would describe NOS used on these devices. In our example, we should create a Platform record for SONiC NOS. Importing the CSV below into Platforms would do it:

```CSV
name,slug
SONiC,sonic
```

When exporting a topology, `nrx` would use `platform.slug` value as node `kind`. Note, that although we used `sonic-vs` for our template names because this is how Containerlab identifies SONiC nodes, in NetBox you would typically use a `platform.name` and `platform.slug` that match NOS name on a physical device. For example, `eos` for Arista EOS, instead of `ceos` for Arista cEOSLab.

Different NetBox users may have very different Platform records. To support `platform.slug` values in your database, create symbolic links that map `slug` value to template names. For our SONiC case, we need to map `sonic` to `sonic-vs.j2`. Here is how:

```Shell
ln -s sonic-vs.j2 clab/kinds/sonic.j2
ln -s sonic-vs.j2 clab/interface_names/sonic.j2
```

This should result in `sonic.j2 -> sonic-vs.j2` in both `clab/kinds` and `clab/interface_names` folders.

## Test your templates

Time to test if your templates work as planned. It is recommended to export a topology from NetBox with devices you made the templates for into a `cyjs` file. This step doesn't actually require the templates to be present. Make sure to update API connection parameters in `nrx.conf`, as well as Device Roles to export:

```Shell
cd ..
nrx.py --config nrx.conf --input netbox --site YOUR_SITE --output cyjs
```

Now you're ready to convert `cyjs` data into Containerlab topology using the new templates:

```Shell
nrx.py --input cyjs --file YOUR_SITE.cyjs --output clab --templates templates --debug
```

Inspect resulting `YOUR_SITE.clab.yaml` and if looks good, try to deploy it with:

```Shell
sudo -E clab deploy -t YOUR_SITE.clab.yaml
```

You might need to adjust your templates and run `nrx` again, using `cyjs` as input.

## Commit your work

Once you are satisfied with the results, commit your work:

```Shell
cd templates
git add .
git commit -m "new template for YOUR_DEVICE_PLATFORM"
```

In case your want to contribute your changes, create a Pull Request into [netreplica/templates](https://github.com/netreplica/templates/compare). Otherwise, just merge the development branch into the `main`:

```Shell
git checkout main
git merge new-clab-kind-sonic-vs
```

# Copyright notice

Copyright 2023 Netreplica Team

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
