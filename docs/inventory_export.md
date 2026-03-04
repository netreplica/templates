# Inventory Export Formats

The inventory export formats provide device-level data exports from NetBox for sharing with users who don't have direct NetBox access. These formats export device information only (no links or interfaces) in user-friendly formats.

## Available Formats

### inventory-csv

A simple CSV (Comma-Separated Values) export suitable for spreadsheets and databases.

**Output**: Single `.csv` file with comma-separated values

**Use Cases**:
- Quick data exports for spreadsheet analysis
- Import into asset management systems
- Sharing device lists via email
- Bulk data processing with scripts

**Columns**:
1. Device Name
2. Role
3. Site
4. Location
5. Rack
6. Platform
7. Vendor
8. Model
9. IPv4 Address (with CIDR notation, e.g., 10.1.1.1/24)
10. IPv6 Address (with prefix length, e.g., 2001:db8::1/64)

**Features**:
- Standard CSV format with header row
- Compatible with Excel, Google Sheets, and database imports
- IP addresses include full subnet masks
- Empty fields output as blank values

**Example Output**:
```csv
Device Name,Role,Site,Location,Rack,Platform,Vendor,Model,IPv4 Address,IPv6 Address
spine01,Spine,Santa Clara,Data Center 1,Rack 1,Arista EOS,Arista,DCS-7280CR3-32P4,10.1.1.1/24,2001:db8::1/64
leaf01,Leaf,Santa Clara,Data Center 1,Rack 2,Arista EOS,Arista,DCS-7050SX3-48YC8,10.1.1.2/24,2001:db8::2/64
```

---

### inventory-html

An interactive HTML report with advanced filtering, search, and device details capabilities.

**Output**: Single `.html` file (self-contained with embedded CSS and JavaScript)

**Use Cases**:
- Sharing interactive device inventory via web browser
- Creating shareable reports with filtering capabilities
- Providing read-only NetBox data access without credentials
- Generating documentation with clickable links

#### Interactive Features

**Table Functionality**:
- **Sortable columns**: Click any column header to sort ascending/descending
- **Real-time search**: Filter devices across all fields as you type
- **Site/Location filters**: Quick-filter buttons with device counts
- **URL parameters**: Shareable links with pre-applied filters
- **Responsive layout**: Fixed column widths prevent horizontal scrolling
- **Auto-hide IPv6**: Column hidden automatically when no IPv6 data present

**Columns** (11 total):
1. Device Name (16% width, clickable for details)
2. Role (9% width, clickable badge)
3. Tags (7% width, expandable colored circles)
4. Site (7% width, clickable filter)
5. Location (7% width, clickable filter)
6. Rack (5% width, searchable)
7. Platform (10% width, searchable)
8. Vendor (7% width)
9. Model (11% width)
10. IPv4 Address (10% width, never truncates)
11. IPv6 Address (10% width, auto-hides if empty)

#### Device Details Modal

Click any device name to open a popup with comprehensive information:

**Sections**:
- **Basic Information**: Device name, status, role, tags, site, location, rack
- **Hardware**: Vendor, model, platform, serial number, asset tag
- **Network**: IPv4, IPv6, and OOB IP addresses (with full CIDR notation)
- **Additional Information**: Description and comments
- **NetBox Link**: Direct link to device page in NetBox

**Modal Features**:
- Copy buttons for device names, serial numbers, and IP addresses
- Monospace fonts for technical values
- Clickable IP addresses (open in new tab)
- Clickable tags (filter table by tag)
- Aligned key-value pairs for readability

#### Tags Display

Device tags are displayed with NetBox colors for visual consistency:

**In Table**:
- Small colored circles (20px diameter)
- Hover to expand and show full tag name
- Smooth animation (0.15s transition)
- Click to filter devices by tag
- Multiple tags displayed inline

**In Modal**:
- Full badge display with tag names visible
- Same colors as NetBox
- Clickable to filter and close modal
- Multiple tags wrap with spacing

#### Technical Details

**Styling**:
- Modern, clean design with hover effects
- Professional color scheme (purple gradients)
- Responsive button states
- Smooth transitions and animations
- Border-radius: 12px for badges (matches role badges)

**JavaScript Features**:
- Real-time table filtering with multiple criteria
- Smooth column sorting with visual indicators (▲/▼)
- Modal popup with JSON data parsing
- Copy-to-clipboard with visual feedback ("Copied!" tooltip)
- URL state management for shareable filtered views
- No external dependencies (all code embedded)

**Browser Compatibility**:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No server required (static HTML file)
- Works offline after initial download

#### URL Parameters

Share filtered views using URL parameters:

- `?site=<site-name>` - Pre-filter by site
- `?location=<location-name>` - Pre-filter by location
- `?search=<search-term>` - Pre-populate search box
- Combine multiple parameters: `?site=Site1&search=spine`

**Example URLs**:
```
inventory.html?site=Santa%20Clara
inventory.html?site=Santa%20Clara&location=DC1
inventory.html?search=spine
inventory.html?site=Site1&search=leaf&location=DC2
```

---

## Usage

### Basic Export

Export inventory for a single site:

```bash
# CSV format
nrx export -o inventory-csv -s "Site Name" -D ./output

# HTML format
nrx export -o inventory-html -s "Site Name" -D ./output
```

### Filter by Multiple Sites

```bash
nrx export -o inventory-html --sites "Site1,Site2,Site3" -D ./output
```

### Filter by Tags

Export only devices with specific tags:

```bash
nrx export -o inventory-html -s "Site Name" -t "production,monitored" -D ./output
```

### Custom Output Name

```bash
nrx export -o inventory-csv -s "Site Name" -n "My Custom Inventory" -D ./output
# Creates: ./output/My Custom Inventory.csv
```

### Using Input File

Export from a previously saved NetBox data file:

```bash
nrx export -i cyjs -f netbox-data.cyjs -o inventory-html -D ./output
```

---

## Template Architecture

### inventory-csv

Simple structure with header and row templates:

```
inventory-csv/
├── topology.j2              # CSV header row
├── nodes/
│   └── default.j2          # CSV data row per device
└── interface_names/
    └── default.j2          # Empty (not used)
```

**Template Features**:
- Clean Jinja2 templates
- Conditional field handling
- Empty value handling

### inventory-html

Modular architecture using DRY principle:

```
inventory-html/
├── topology.j2              # Main HTML structure (37 lines)
├── nodes/
│   └── default.j2          # Table row template per device
├── interface_names/
│   └── default.j2          # Empty (not used)
├── _styles.css             # All CSS styling (503 lines)
├── _scripts.js             # All JavaScript (467 lines)
├── _modal.html             # Device details modal structure
├── _table_header.html      # Table column headers
├── _controls.html          # Search and filter controls
└── _copy_icon.j2           # Reusable SVG copy icon
```

**Design Principles**:
- **Separation of concerns**: HTML, CSS, and JavaScript in separate files
- **Proper file extensions**: `.css`, `.js`, `.html` for non-Jinja2 content
- **Reusable components**: Include files for common elements
- **Single output file**: All includes embedded in generated HTML
- **No external dependencies**: Fully self-contained output

---

## Data Handling

### Empty Fields

**CSV**: Empty fields output as blank (no placeholder text)

**HTML**: Empty fields display as "-" in gray italics

### Special Characters

Both formats handle special characters safely:
- **CSV**: Values quoted when containing commas
- **HTML**: Proper HTML entity encoding

### IP Addresses

**CSV**: Full CIDR notation preserved
- IPv4: `10.1.1.1/24`
- IPv6: `2001:db8::1/64`

**HTML**:
- Table displays IP address only (no netmask)
- Modal shows full CIDR notation
- Clickable links to open in browser

### Tags

**CSV**: Tags not included (device-level data only)

**HTML**:
- Tags displayed with NetBox colors
- Full tag data structure (name, color, slug, etc.)
- Clickable for filtering

---

## Comparison

| Feature | inventory-csv | inventory-html |
|---------|--------------|----------------|
| **Format** | Plain text CSV | Interactive HTML |
| **File Size** | Small (~1-10 KB per 100 devices) | Larger (~100-500 KB with styles/scripts) |
| **Interactivity** | None | Full (search, sort, filter, modal) |
| **Tags** | Not included | Colored badges with filtering |
| **IP Format** | Full CIDR | IP only (full in modal) |
| **Sharing** | Email, spreadsheet | Web browser, file share |
| **Processing** | Import to tools | View directly |
| **Dependencies** | Spreadsheet app | Web browser only |
| **Offline Use** | Always | Yes (static file) |
| **Edit Data** | Yes (in spreadsheet) | No (read-only) |
| **NetBox Links** | No | Yes (device pages) |

---

## Tips and Best Practices

### For CSV Format

1. **Import into Excel**: Use "Data → From Text/CSV" for proper import
2. **IP Address Handling**: Format IP columns as text to preserve leading zeros
3. **Automation**: Use CSV for scripting and bulk operations
4. **Database Import**: Use for populating asset management systems
5. **Version Control**: CSV diffs well in Git for tracking changes

### For HTML Format

1. **Sharing**: Host on internal web server or share file directly
2. **Bookmarking**: Save filtered URLs for quick access
3. **Documentation**: Embed in Confluence or SharePoint
4. **Printing**: Use browser print for PDF generation
5. **Mobile Access**: Works on tablets and phones (responsive layout)
6. **Filtering**: Combine search with site/location filters for precision
7. **Tags**: Use tag filtering to find devices with specific configurations

### General Tips

1. **Naming**: Use descriptive names with `-n` flag for clarity
2. **Organization**: Create folders by date or purpose
3. **Filtering**: Use NetBox tags to group related devices
4. **Scheduling**: Automate exports with cron jobs
5. **Archiving**: Keep historical snapshots for audit trails

---

## Troubleshooting

### CSV Issues

**Problem**: Commas in device names break columns
**Solution**: Values with commas are automatically quoted

**Problem**: Excel shows dates instead of text (e.g., rack "1-2")
**Solution**: Import as text, not general format

### HTML Issues

**Problem**: File too large to email
**Solution**: Compress with ZIP or host on web server

**Problem**: Filters not working
**Solution**: Ensure JavaScript enabled in browser

**Problem**: Tags not showing colors
**Solution**: Verify NetBox tag colors are set (hex format)

---

## Future Enhancements

Potential improvements for future versions:

- **CSV**: Add optional tags column, serial numbers, status fields
- **HTML**:
  - Export filtered results to CSV
  - Print-friendly view
  - Dark mode toggle
  - Customizable column visibility
  - Equipment hierarchy visualization
  - Export to Excel directly

---

## Related Documentation

- [Output Formats Guide](output_formats.md) - Creating new format templates
- [Interface Maps](interface_maps.md) - Interface naming conventions
- [formats.yaml](../formats.yaml) - Format definitions

---

*Last updated: 2026-03-04*
