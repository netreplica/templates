    <script>
        let currentSite = '';
        let currentLocation = '';

        // Parse URL parameters
        function getUrlParams() {
            const params = new URLSearchParams(window.location.search);
            return {
                site: params.get('site') || '',
                location: params.get('location') || '',
                search: params.get('search') || ''
            };
        }

        // Update URL with current filter state
        function updateUrl() {
            const params = new URLSearchParams();

            if (currentSite) {
                params.set('site', currentSite);
            }

            if (currentLocation) {
                params.set('location', currentLocation);
            }

            const searchValue = document.getElementById('searchInput').value;
            if (searchValue) {
                params.set('search', searchValue);
            }

            const newUrl = params.toString() ?
                window.location.pathname + '?' + params.toString() :
                window.location.pathname;

            history.replaceState(null, '', newUrl);
        }

        // Populate site and location buttons on page load
        document.addEventListener('DOMContentLoaded', function() {
            const table = document.getElementById('inventoryTable');
            const rows = table.getElementsByTagName('tr');
            const sites = new Set();
            const locations = new Set();
            let hasIpv4 = false;
            let hasIpv6 = false;

            // Extract unique sites and locations from table, check for IPv4 and IPv6
            for (let i = 1; i < rows.length; i++) {
                const siteCell = rows[i].cells[3]; // Site is column 3
                const locationCell = rows[i].cells[4]; // Location is column 4
                const ipv4Cell = rows[i].cells[9]; // IPv4 is column 9
                const ipv6Cell = rows[i].cells[10]; // IPv6 is column 10

                if (siteCell) {
                    const siteText = siteCell.textContent.trim();
                    if (siteText) {
                        sites.add(siteText);
                    }
                }

                if (locationCell) {
                    const locationText = locationCell.textContent.trim();
                    if (locationText && locationText !== '-') {
                        locations.add(locationText);
                    }
                }

                // Check if IPv4 column has any data
                if (ipv4Cell) {
                    const ipv4Text = ipv4Cell.textContent.trim();
                    if (ipv4Text && ipv4Text !== '-') {
                        hasIpv4 = true;
                    }
                }

                // Check if IPv6 column has any data
                if (ipv6Cell) {
                    const ipv6Text = ipv6Cell.textContent.trim();
                    if (ipv6Text && ipv6Text !== '-') {
                        hasIpv6 = true;
                    }
                }
            }

            // Hide IPv4 column if no data
            if (!hasIpv4) {
                const tableContainer = document.querySelector('.table-container');
                tableContainer.classList.add('hide-ipv4-column');
            }

            // Hide IPv6 column if no data
            if (!hasIpv6) {
                const tableContainer = document.querySelector('.table-container');
                tableContainer.classList.add('hide-ipv6-column');
            }

            // Populate site buttons with sorted sites
            const siteButtons = document.getElementById('siteButtons');
            const sortedSites = Array.from(sites).sort();
            sortedSites.forEach(site => {
                const button = document.createElement('button');
                button.className = 'location-btn';
                button.textContent = site;
                button.onclick = function() { filterBySite(site); };
                siteButtons.appendChild(button);
            });

            // Populate location buttons with sorted locations
            const locationButtons = document.getElementById('locationButtons');
            Array.from(locations).sort().forEach(location => {
                const button = document.createElement('button');
                button.className = 'location-btn';
                button.textContent = location;
                button.onclick = function() { filterByLocation(location); };
                locationButtons.appendChild(button);
            });

            // Get URL parameters
            const urlParams = getUrlParams();

            // Apply search from URL if present
            if (urlParams.search) {
                document.getElementById('searchInput').value = urlParams.search;
                toggleClearButton();
            }

            // Apply filters from URL or defaults
            let siteToSelect = urlParams.site;
            let locationToSelect = urlParams.location;

            // If no site in URL and only one site exists, select it by default
            if (!siteToSelect && sortedSites.length === 1) {
                siteToSelect = sortedSites[0];
            }

            // Apply site filter
            if (siteToSelect) {
                filterBySite(siteToSelect);
            }

            // Apply location filter
            if (locationToSelect) {
                filterByLocation(locationToSelect);
            }

            // If we applied search from URL, trigger filter
            if (urlParams.search) {
                filterTable();
            }

            // Sort by device name (column 0) in descending order by default on page load
            table.setAttribute('data-sort-asc', 'true'); // Set to true so sortTable will reverse to descending
            sortTable(0);
        });

        function filterBySite(site) {
            currentSite = site;

            // Update active button state for site buttons
            const siteButtons = document.querySelectorAll('#siteButtons .location-btn');
            siteButtons.forEach(btn => {
                if ((site === '' && btn.textContent === 'All') ||
                    (btn.textContent === site)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Hide/show site column based on selection
            const tableContainer = document.querySelector('.table-container');
            if (site === '') {
                tableContainer.classList.remove('hide-site-column');
            } else {
                tableContainer.classList.add('hide-site-column');
            }

            updateUrl();
            filterTable();
        }

        function filterByLocation(location) {
            currentLocation = location;

            // Update active button state for location buttons
            const locationButtons = document.querySelectorAll('#locationButtons .location-btn');
            locationButtons.forEach(btn => {
                if ((location === '' && btn.textContent === 'All') ||
                    (btn.textContent === location)) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Hide/show location column based on selection
            const tableContainer = document.querySelector('.table-container');
            if (location === '') {
                tableContainer.classList.remove('hide-location-column');
            } else {
                tableContainer.classList.add('hide-location-column');
            }

            updateUrl();
            filterTable();
        }

        function filterBySearch(searchTerm) {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = searchTerm;
            toggleClearButton();
            updateUrl();
            filterTable();
        }

        function handleSearchInput(event) {
            toggleClearButton();

            // Update URL only on Enter key
            if (event && event.key === 'Enter') {
                updateUrl();
            }

            filterTable();
        }

        function toggleClearButton() {
            const searchInput = document.getElementById('searchInput');
            const clearButton = document.getElementById('clearSearch');
            if (searchInput.value) {
                clearButton.classList.add('visible');
            } else {
                clearButton.classList.remove('visible');
            }
        }

        function clearSearch() {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = '';
            toggleClearButton();
            updateUrl();  // Update URL when clearing
            filterTable();
        }

        function filterTable() {
            const searchInput = document.getElementById('searchInput');
            const searchFilter = searchInput.value.toLowerCase();
            const table = document.getElementById('inventoryTable');
            const rows = table.getElementsByTagName('tr');

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const cells = row.getElementsByTagName('td');
                const siteCell = cells[3]; // Site is column 3
                const locationCell = cells[4]; // Location is column 4
                let matchesSearch = false;
                let matchesSite = true;
                let matchesLocation = true;

                // Check search filter (all columns)
                if (searchFilter) {
                    for (let j = 0; j < cells.length; j++) {
                        if (cells[j].textContent.toLowerCase().indexOf(searchFilter) > -1) {
                            matchesSearch = true;
                            break;
                        }
                    }
                } else {
                    matchesSearch = true;
                }

                // Check site filter
                if (currentSite && siteCell) {
                    const siteText = siteCell.textContent.trim();
                    matchesSite = siteText === currentSite;
                }

                // Check location filter
                if (currentLocation && locationCell) {
                    const locationText = locationCell.textContent.trim();
                    matchesLocation = locationText === currentLocation;
                }

                // Show row only if it matches all filters
                row.style.display = (matchesSearch && matchesSite && matchesLocation) ? '' : 'none';
            }
        }

        function sortTable(column) {
            const table = document.getElementById('inventoryTable');
            const rows = Array.from(table.rows).slice(1);
            const isAscending = table.getAttribute('data-sort-asc') === 'true';

            rows.sort((a, b) => {
                const aText = a.cells[column].textContent.trim();
                const bText = b.cells[column].textContent.trim();

                if (aText === bText) return 0;

                const comparison = aText.localeCompare(bText, undefined, {numeric: true});
                return isAscending ? comparison : -comparison;
            });

            rows.forEach(row => table.tBodies[0].appendChild(row));
            table.setAttribute('data-sort-asc', !isAscending);
        }

        // Modal functions
        function showDeviceDetails(rowElement) {
            const deviceData = JSON.parse(rowElement.getAttribute('data-device-info'));
            const modal = document.getElementById('deviceModal');
            const modalBody = document.getElementById('modalBody');
            const modalTitle = document.getElementById('modalDeviceName');

            modalTitle.textContent = deviceData.name;

            let detailsHTML = '';

            // Copy icon SVG
            const copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>';

            // Basic Information Section
            detailsHTML += '<div class="detail-section">';
            detailsHTML += '<div class="detail-section-title">Basic Information</div>';
            detailsHTML += '<div class="detail-grid">';

            detailsHTML += '<div class="detail-label">Device Name:</div>';
            detailsHTML += '<div class="detail-value detail-value-with-copy">' + deviceData.name + '<button class="copy-btn" onclick="copyToClipboard(\'' + deviceData.name + '\', this)" title="Copy to clipboard">' + copyIcon + '</button></div>';

            if (deviceData.status) {
                detailsHTML += '<div class="detail-label">Status:</div>';
                detailsHTML += '<div class="detail-value">' + deviceData.status + '</div>';
            }

            detailsHTML += '<div class="detail-label">Role:</div>';
            detailsHTML += '<div class="detail-value"><span class="role-badge">' + deviceData.role + '</span></div>';

            if (deviceData.tags && deviceData.tags.length > 0) {
                detailsHTML += '<div class="detail-label">Tags:</div>';
                detailsHTML += '<div class="detail-value">';
                deviceData.tags.forEach(function(tag) {
                    detailsHTML += '<span class="tag-badge" style="background-color: #' + tag.color + '; color: white; display: inline-block; padding: 4px 10px; border-radius: 12px; margin: 0 6px 4px 0; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid rgba(0, 0, 0, 0.1);" onclick="closeModal(); filterBySearch(\'' + tag.name + '\')">' + tag.name + '</span>';
                });
                detailsHTML += '</div>';
            }

            detailsHTML += '<div class="detail-label">Site:</div>';
            detailsHTML += '<div class="detail-value">' + deviceData.site + '</div>';

            if (deviceData.location) {
                detailsHTML += '<div class="detail-label">Location:</div>';
                detailsHTML += '<div class="detail-value">' + deviceData.location;
                if (deviceData.location_description) {
                    detailsHTML += ' <span style="color: #999; font-size: 12px;">(' + deviceData.location_description + ')</span>';
                }
                detailsHTML += '</div>';
            }

            if (deviceData.rack) {
                detailsHTML += '<div class="detail-label">Rack:</div>';
                detailsHTML += '<div class="detail-value">' + deviceData.rack + '</div>';
            }

            detailsHTML += '</div></div>';

            // Hardware Information Section
            detailsHTML += '<div class="detail-section">';
            detailsHTML += '<div class="detail-section-title">Hardware</div>';
            detailsHTML += '<div class="detail-grid">';

            detailsHTML += '<div class="detail-label">Vendor:</div>';
            detailsHTML += '<div class="detail-value">' + deviceData.vendor + '</div>';

            detailsHTML += '<div class="detail-label">Model:</div>';
            detailsHTML += '<div class="detail-value">' + deviceData.model + '</div>';

            detailsHTML += '<div class="detail-label">Platform:</div>';
            detailsHTML += '<div class="detail-value">' + deviceData.platform + '</div>';

            if (deviceData.serial) {
                detailsHTML += '<div class="detail-label">Serial Number:</div>';
                detailsHTML += '<div class="detail-value detail-value-with-copy">' + deviceData.serial + '<button class="copy-btn" onclick="copyToClipboard(\'' + deviceData.serial + '\', this)" title="Copy to clipboard">' + copyIcon + '</button></div>';
            }

            if (deviceData.asset_tag) {
                detailsHTML += '<div class="detail-label">Asset Tag:</div>';
                detailsHTML += '<div class="detail-value">' + deviceData.asset_tag + '</div>';
            }

            detailsHTML += '</div></div>';

            // Network Information Section
            if (deviceData.ipv4 || deviceData.ipv6 || deviceData.oob_ip) {
                detailsHTML += '<div class="detail-section">';
                detailsHTML += '<div class="detail-section-title">Network</div>';
                detailsHTML += '<div class="detail-grid">';

                if (deviceData.ipv4) {
                    detailsHTML += '<div class="detail-label">Primary IPv4:</div>';
                    detailsHTML += '<div class="detail-value detail-value-with-copy"><a href="https://' + deviceData.ipv4 + '" target="_blank">' + (deviceData.ipv4_full || deviceData.ipv4) + '</a><button class="copy-btn" onclick="copyToClipboard(\'' + (deviceData.ipv4_full || deviceData.ipv4) + '\', this)" title="Copy to clipboard">' + copyIcon + '</button></div>';
                }

                if (deviceData.ipv6) {
                    detailsHTML += '<div class="detail-label">Primary IPv6:</div>';
                    detailsHTML += '<div class="detail-value detail-value-with-copy"><a href="https://[' + deviceData.ipv6 + ']" target="_blank">' + (deviceData.ipv6_full || deviceData.ipv6) + '</a><button class="copy-btn" onclick="copyToClipboard(\'' + (deviceData.ipv6_full || deviceData.ipv6) + '\', this)" title="Copy to clipboard">' + copyIcon + '</button></div>';
                }

                if (deviceData.oob_ip) {
                    detailsHTML += '<div class="detail-label">OOB IP:</div>';
                    detailsHTML += '<div class="detail-value detail-value-with-copy"><a href="https://' + deviceData.oob_ip + '" target="_blank">' + (deviceData.oob_ip_full || deviceData.oob_ip) + '</a><button class="copy-btn" onclick="copyToClipboard(\'' + (deviceData.oob_ip_full || deviceData.oob_ip) + '\', this)" title="Copy to clipboard">' + copyIcon + '</button></div>';
                }

                detailsHTML += '</div></div>';
            }

            // Additional Information Section
            if (deviceData.description || deviceData.comments) {
                detailsHTML += '<div class="detail-section">';
                detailsHTML += '<div class="detail-section-title">Additional Information</div>';
                detailsHTML += '<div class="detail-grid">';

                if (deviceData.description) {
                    detailsHTML += '<div class="detail-label">Description:</div>';
                    detailsHTML += '<div class="detail-value">' + deviceData.description + '</div>';
                }

                if (deviceData.comments) {
                    detailsHTML += '<div class="detail-label">Comments:</div>';
                    detailsHTML += '<div class="detail-value">' + deviceData.comments + '</div>';
                }

                detailsHTML += '</div></div>';
            }

            // NetBox Link Section
            if (deviceData.display_url) {
                detailsHTML += '<div class="detail-section">';
                detailsHTML += '<div class="detail-grid">';
                detailsHTML += '<div class="detail-label">NetBox:</div>';
                detailsHTML += '<div class="detail-value"><a href="' + deviceData.display_url + '" target="_blank">View in NetBox</a></div>';
                detailsHTML += '</div></div>';
            }

            modalBody.innerHTML = detailsHTML;
            modal.style.display = 'block';
        }

        function closeModal() {
            const modal = document.getElementById('deviceModal');
            modal.style.display = 'none';
        }

        // Copy to clipboard function
        function copyToClipboard(text, buttonElement) {
            // SVG icons
            const copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>';
            const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>';

            navigator.clipboard.writeText(text).then(function() {
                // Visual feedback - change icon to checkmark
                const originalHTML = buttonElement.innerHTML;
                buttonElement.innerHTML = checkIcon;
                buttonElement.classList.add('copied');
                buttonElement.setAttribute('title', 'Copied!');

                // Reset after 2 seconds
                setTimeout(function() {
                    buttonElement.innerHTML = originalHTML;
                    buttonElement.classList.remove('copied');
                    buttonElement.setAttribute('title', 'Copy to clipboard');
                }, 2000);
            }).catch(function(err) {
                console.error('Failed to copy text: ', err);
                buttonElement.setAttribute('title', 'Failed to copy');
            });
        }

        // Close modal when clicking outside of it
        window.onclick = function(event) {
            const modal = document.getElementById('deviceModal');
            if (event.target == modal) {
                closeModal();
            }
        }

        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeModal();
            }
        });
    </script>
