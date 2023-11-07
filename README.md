[![Discord](https://img.shields.io/discord/1075106069862416525?label=discord)](https://discord.gg/M2SkgSdKht)

# Netreplica Templates to build Emulated Network Topologies

We created this repository as a collection of templates for [netreplica nrx](https://github.com/netreplica/nrx/blob/main/README.md) software. It might be useful outside of **nrx** for any other effort to automate creation of software network labs.

This repository provides a set of such templates as a starting point. You're welcome to clone and adopt to your needs. If you'd like to contribute back, it would be greatly appreciated.

This project is in a proof-of-concept phase. We're experimenting with the best ways to automate software network lab orchestration. If you have any feedback, questions or suggestions, please reach out to us via the Netreplica Discord server linked above, [#netreplica](https://netdev-community.slack.com/archives/C054GKBC4LB) channel in NetDev Community on Slack, or open a github issue in this repository.

# Supported formats

* [Containerlab](https://containerlab.dev/) – Open-source network emulation software using containers.
* [Cisco Modeling Labs](https://developer.cisco.com/modeling-labs/) - Commercial network emulation software from Cisco.
* [Graphite](https://github.com/netreplica/graphite) - Network topology visualization software from Netreplica.
* [D2](https://d2lang.com/) – Declarative diagramming language.
* **nrx** software also supports user-provided formats. You can extend this repository with your own set of templates.

# What is included

| Platform                 | Containerlab                                              | CML                                                | Interface Mapping                                     | Startup Config |
| --------------           | ------------                                              | --------                                           |  --------                                             | -------------- |
| Arista EOS               | [`ceos`             ](clab/nodes/ceos.j2)                 | `no`                                               | [Interface Map](clab/interface_maps/ceos.j2)               | `clab`         |
| Cisco CSR1000v           | [`vr-cisco_csr1000v`](clab/nodes/vr-cisco_csr1000v.j2)    | `no`                                               | Not supported                                         | `clab`         |
| Cisco IOSv               | `no`                                                      | [`iosv`                  ](cml/nodes/iosv.j2)      | [CML Node Template](cml/nodes/iosv.j2)                | `cml`          |
| Cisco IOSvL2             | `no`                                                      | [`iosvl2`                ](cml/nodes/iosvl2.j2)    | [CML Node Template](cml/nodes/iosvl2.j2)              | `cml`          |
| Cisco NX-OSv9000         | `no`                                                      | [`nxosv9000`             ](cml/nodes/nxosv9000.j2) | [CML Node Template](cml/nodes/nxosv9000.j2)           | `cml`          |
| Linux                    | [`linux`            ](clab/nodes/linux.j2)                | `no`                                               | Not supported                                         | wanted         |
| [RARE/freeRtr](http://docs.freertr.org/) | [`rare`](clab/nodes/rare.j2)              | `no`                                               | Not supported                                         | wanted         |
| Nokia SR-Linux           | [`srl`              ](clab/nodes/srl.j2)                  | `no`                                               | [Clab Interface Naming](clab/interface_names/srl.j2)  | `clab`         |
| SONiC                    | [`sonic-vs`         ](clab/nodes/sonic-vs.j2)             | `no`                                               | Not supported                                         | wanted         |
| Ubuntu                   | `ubuntu` -> [`linux`](clab/nodes/linux.j2)                | [`ubuntu`                ](cml/nodes/ubuntu.j2)    | Not supported                                         | wanted         |
| Default                  | `default` -> [`linux`](clab/nodes/linux.j2)               | `default` -> [`iosvl2`   ](cml/nodes/iosvl2.j2)    | Not supported                                         | n/a            |

# Template naming convention

Containerlab artifacts:

* `clab/topology.j2`: template for the final Containerlab topology file.
* `clab/nodes/<kind>.j2`: templates for individual Containerlab node entries in the topology file.
* `clab/interface_names/<kind>.j2`: templates for generating emulated interface names used by the NOS `kind` in Containerlab.
* `clab/interface_maps/<kind>.j2`: templates for mappings between real interface names and emulated interface names used by the NOS `kind`. Not all `kinds` support such mappings.

Cisco Modeling Labs artifacts:

* `cml/topology.j2`: template for the final CML topology file.
* `cml/nodes/<kind>.j2`: templates for individual CML node entries in the topology file.
* `cml/interface_names/<kind>.j2`: templates for generating emulated interface names used by the NOS `kind` in CML.
* `cml/configs/<family>.j2`: templates for embedding startup configuration in the topology file. Use `<family>` to denote NOS family like `ios`, `nxos`, etc.

To customize the way a topology file should be generated, change these templates as needed. For example, you might want to modify `image` values depending on the `kind`. You can also add new templates, if the platforms you have are not covered by the provided set of templates.

# How to add a new template

## Clone the repository

Suppose you want to add a set of templates for a new node kind. The first step is to clone this repository:

```Shell
git clone https://github.com/netreplica/templates.git
```

> Note, if you would like to contribute your templates back to the community, please [fork](https://github.com/netreplica/templates/fork) the repository first and then clone the fork instead.

As a practical example, let's create templates for Containerlab `sonic-vs` kind. This kind represents [SONiC](https://sonic-net.github.io/SONiC/) open-source NOS.

As a next step, let's create a new development branch, for example `new-clab-kind-sonic-vs`:

```Shell
cd templates
git checkout -b new-clab-kind-sonic-vs
```

## Define the output format

This step is required only if you're creating a new set of templates for a new output format. In the next sections, we're adding templates for Containerlab, which is already supported by this repository. If you're following a similar path, you can skip this step.

If you do intend to create a new output format, create a subfolder for it under the `templates` directory. For example, `myformat` for you special format:

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

Next steps describe adding a new kind to an existing output format `clab`.

## Create a template under `nodes`

Now, we need to create a template called `sonic-vs.j2` under `clab/nodes` directory:
* `nrx` will pass the name of the node to the template as `name` variable
* According to [documentation](https://containerlab.dev/manual/kinds/sonic-vs/), we should use `kind: sonic-vs` to describe SONiC nodes
* As mentioned before, the Docker tag for the image will be `netreplica/docker-sonic-vs:latest`
* For better visualization with [Graphite](https://github.com/netreplica/graphite), we will use a [custom label](https://github.com/netreplica/graphite/blob/main/docs/CONTAINERLAB.md#changing-visualization-icons) `graph-icon: switch`
* Including [`clab/labels.j2`](clab/labels.j2) will add some common labels, like `graph-level` to [visually align](https://github.com/netreplica/graphite/blob/main/docs/CONTAINERLAB.md#improve-visualization-via-custom-labels-in-a-containerlab-yaml-file) nodes in Graphite
* Another variable `nrx` will pass to the template is `interface_map` if [such a template](#create-a-template-under-interface_maps) was rendered for this node (uncommon)

```Yaml
cat > clab/nodes/sonic-vs.j2 << EOF
        {{ name }}:
            kind: sonic-vs
            {% if image is not defined %}
            {% set image = "sonic-vs:latest" %}
            {% endif %}
            {% include 'clab/node_params.j2' %}
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

## Check NetBox `platform.slug` values

Now that you created the template files, check relevant Device records in NetBox – specifically, what Platform is used in their configuration. If no Platform is configured currently, create a new Platform record that would describe NOS used on these devices. In our example, we should create a Platform record for SONiC NOS. Importing the CSV below into Platforms would do it:

```CSV
name,slug
SONiC,sonic
```

Note, that although we used `sonic-vs` for our template names because this is how Containerlab identifies SONiC nodes, in NetBox you would typically use a `platform.name` and `platform.slug` that match NOS name on a physical device. For example, `eos` for Arista EOS, instead of `ceos` for Arista cEOSLab.

## Update `platform_map.yaml`

Different NetBox users may have very different Platform records. To support `platform.slug` values from your NetBox instance, we can map them to the kind `sonic-vs` using [`platform_map.yaml`](platform_map.yaml).

For our SONiC case, we need to map `sonic` to `sonic-vs`. Add the following entry to the `platform_map.yaml` under the `platforms` section:

```Yaml
platforms:              # this line already exists, do not add it again
  sonic:                # platform.slug value from NetBox
    kinds:
      clab: sonic-vs    # template name (kind) to use in Containerlab topologies
```

You may also want to provide paths to the templates to be used for `sonic-vs` kind explicitly. If not provided, `nrx` will first look for `sonic-vs.j2` and then for `default.j2` files in the respective folders. The configuration below will tell `nrx` to skip looking for `sonic-vs.j2` when determining interface names, and use `default.j2` right away.

You can also override parameters used in the template. Most common example would be to use a different image tag. There is a [Docker image for SONiC](https://hub.docker.com/r/netreplica/docker-sonic-vs) hosted under [Netrepica Docker Hub](https://hub.docker.com/u/netreplica) with an image tag `netreplica/docker-sonic-vs:latest`, and this is what we are going to use.

```Yaml
kinds:                  # this line already exists, do not add it again
  clab:                 # this line already exists, do not add it again
    sonic-vs:           # kind value mapped under platforms section
      nodes:            # template parameters used to render the nodes
        template: clab/nodes/sonic-vs.j2
        image: netreplica/docker-sonic-vs:latest
      interface_names: # template parameters used to render the interface names
        template: clab/interface_names/default.j2
```

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
