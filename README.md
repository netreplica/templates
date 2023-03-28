# Netreplica Templates to build Emulated Network Topologies

We created this repository to as a collection of templates for [netreplica nrx](https://github.com/netreplica/nrx) software. It might be useful outside of **nrx** for any other effort to automate creation of software network labs.

This repository provides a set of such templates as a starting point. You're welcome to clone and adopt to your needs. If you'd like to contribute back, it would be greatly appreciated.

# Supported Network Emulation Engines

* [Containerlab](https://containerlab.dev/)

# What is included

Containerlab artifacts:

* `clab/topology.j2`: template for the final Containerlab topology file.
* `clab/kinds/<kind>.j2`: templates for individual Containerlab node entries.

NOS-specific artifacts:

* `interface_names/<kind>.j2`: templates for generating emulated interface names used by the NOS `kind`.
* `interface_maps/<kind>.j2`: templates for mappings between real interface names and emulated interface names used by the NOS `kind`.

To customize the way Containerlab topology file should be generated, you would need to change these templates as needed. For example, you might want to change `image` values depending on the `kind`. You can also add new templates, if the platforms you have are not covered by the provided set of templates. In case a template for the needed `kind` already exists, but in NetBox you're using a different `device.platform.slug` value for it, you can either rename the template, or create a symbolic link to it with a new name.

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