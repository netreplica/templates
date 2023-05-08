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
| Nokia SR-Linux           | [`srl`              ](clab/kinds/srl.j2)                  | `no`                                               | [Clab Interface Naming](clab/interface_names/srl.j2)  |
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

Some network operating systems, like [Arista cEOS](https://containerlab.dev/manual/kinds/ceos/#user-defined-interface-mapping), have a mechanism to map emulated interface names created by the engines like Containerlab to interface names used by the NOS. To support such mechanism, `nrx` can render a template from the `interface_maps` directory, if it finds a file for the node kind in that directory. See [`ceos.j2`](interface_maps/ceos.j2) as an example. `nrx` will pass a `map` dictionary variable to these templates:
* `key` – original interface name exported from NetBox
* `value` – a dictionary with
   * `name` – name of the emulated interface name as rendered via `interface_names` template
   * `index` - position of the interface in the list of exported interfaces for this node, sorted by name

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