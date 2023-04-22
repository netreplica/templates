[![Discord](https://img.shields.io/discord/1075106069862416525?label=discord)](https://discord.gg/M2SkgSdKht)

# Netreplica Templates to build Emulated Network Topologies

We created this repository as a collection of templates for [netreplica nrx](https://github.com/netreplica/nrx/blob/main/README.md) software. It might be useful outside of **nrx** for any other effort to automate creation of software network labs.

This repository provides a set of such templates as a starting point. You're welcome to clone and adopt to your needs. If you'd like to contribute back, it would be greatly appreciated.

This project is in a proof-of-concept phase. We're experimenting with the best ways to automate software network lab orchestration. If you have any feedback, questions or suggestions, please reach out to us via the Netreplica Discord server linked above, [#netreplica](https://netdev-community.slack.com/archives/C054GKBC4LB) channel in NetDev Community on Slack, or open a github issue in this repository.

# Supported Network Emulation Engines

* [Containerlab](https://containerlab.dev/)
* [Cisco Modeling Labs](https://developer.cisco.com/modeling-labs/)

# What is included

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