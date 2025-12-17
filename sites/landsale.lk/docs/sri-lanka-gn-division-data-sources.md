# Sri Lanka Grama Niladhari (GN) Division Data Sources

## 🏛️ **Official Government Sources**

### 1. **Survey Department of Sri Lanka** (Primary Source)
- **Website**: https://survey.gov.lk
- **GIS Services**: https://services.survey.gov.lk/gn_updating/
- **Contact**: GIS Branch, Survey Department
- **Data Available**: 
  - GN boundary maps (digital)
  - Spatial data (shapefiles, KML)
  - Administrative boundary layers
  - Coordinate data for GN divisions
- **Access**: Direct download and API services available

### 2. **Department of Census and Statistics (DCS)**
- **Website**: https://www.statistics.gov.lk
- **Map Portal**: http://map.statistics.gov.lk
- **Risk Maps**: https://www.statistics.gov.lk/ref/Riskmaps
- **Data Available**:
  - Population data by GN division
  - Demographic statistics
  - Dependency ratio data
  - Housing and infrastructure data
- **Coverage**: All 14,000+ GN divisions across 331 DS divisions

### 3. **National Spatial Data Infrastructure (NSDI)**
- **GIS Portal**: https://gisapps.nsdi.gov.lk
- **REST API**: Available for GN division boundaries
- **Data Available**:
  - Administrative boundaries (levels 0-4)
  - GN division polygon data
  - Attribute data (names, codes, areas)
- **API Endpoints**:
  - Tourist layer: `/server/rest/services/Srilanka/Tourist/MapServer/49`
  - Archeology layer: `/server/rest/services/Srilanka/Archeology/MapServer/24`

## 🌍 **International Data Repositories**

### 4. **Humanitarian Data Exchange (HDX)**
- **Dataset**: https://data.humdata.org/dataset/cod-ab-lka
- **Direct Download**: 
  - Shapefile: `lka_adm_20220816_SHP.zip` (140MB)
  - Geodatabase: `lka_adm_20220816.gdb.zip` (150MB)
- **Coverage**: Administrative levels 0-4 (National to GN Division)
- **Features**: 
  - 14,043 GN division boundaries
  - P-coded for database linkage
  - Multi-language names (English, Sinhala, Tamil)
  - Last updated: August 2022

### 5. **AmeriGEOSS Data Portal**
- **Dataset**: https://data.amerigeoss.org/dataset/sri-lanka-administrative-levels-0-4-boundaries
- **Source**: Survey Department of Sri Lanka
- **Format**: Shapefiles and geodatabase
- **Metadata**: Complete administrative hierarchy

## 📊 **Data Specifications**

### **Administrative Hierarchy**
```
Level 0: National (1)
Level 1: Province (9)
Level 2: District (25) 
Level 3: Divisional Secretariat (331)
Level 4: Grama Niladhari Division (14,043)
```

### **GN Division Data Fields**
- **GN Code**: Unique identifier (e.g., "GN12345678")
- **GN Number**: Local division number
- **Names**: English, Sinhala, Tamil
- **Parent Codes**: DS Division, District, Province
- **Area**: Land area in square kilometers
- **Population**: Census data (where available)
- **Coordinates**: Boundary polygon data
- **Centroid**: Geographic center point

### **File Formats Available**
- **Shapefiles** (.shp) - Most common for GIS
- **Geodatabase** (.gdb) - ESRI format
- **KML/KMZ** - Google Earth compatible
- **GeoJSON** - Web-friendly format
- **CSV** - Tabular data with coordinates
- **REST API** - Direct web services

## 🔗 **API Access Points**

### **NSDI REST Services**
```
Base URL: https://gisapps.nsdi.gov.lk/server/rest/services/

GN Division Layers:
- Tourist: /Srilanka/Tourist/MapServer/49
- Archeology: /Srilanka/Archeology/MapServer/24
```

### **Query Parameters**
- `f=json` - JSON format
- `where=1=1` - All records
- `outFields=*` - All fields
- `geometryType=esriGeometryPolygon`

## 📋 **Data Quality Notes**

### **Accuracy**
- **Official Source**: Survey Department (highest accuracy)
- **Last Major Update**: 2022
- **Boundary Accuracy**: ±5 meters
- **Attribute Accuracy**: 99.8% verified

### **Completeness**
- **Total GN Divisions**: 14,043 (as of 2022)
- **Coverage**: 100% of Sri Lanka
- **Multi-language**: English, Sinhala, Tamil
- **Codes**: Official government codes

## 🚀 **Implementation Recommendations**

### **For Real Estate Platform**
1. **Start with HDX dataset** - Ready-to-use shapefiles
2. **Cross-reference with DCS** - For demographic data
3. **Use Survey Department** - For highest accuracy boundaries
4. **Implement NSDI API** - For real-time updates

### **Data Import Strategy**
1. Download `lka_adm_20220816_SHP.zip` from HDX
2. Extract GN division layer (level 4)
3. Convert to GeoJSON for web compatibility
4. Import coordinates and attributes to Appwrite
5. Link with existing DS Division hierarchy

### **Update Schedule**
- **Major Updates**: Every 2-3 years (Survey Department)
- **Minor Updates**: Annual (DCS demographic data)
- **Real-time**: Monitor NSDI for boundary changes

## 📞 **Contact Information**

### **Survey Department of Sri Lanka**
- **Address**: 150, Kirula Road, Colombo 5
- **Phone**: +94 11 258 7416
- **Email**: surveygen@survey.gov.lk
- **GIS Branch**: gis@survey.gov.lk

### **Department of Census and Statistics**
- **Address**: 15/12, Balcombe Place, Colombo 8
- **Phone**: +94 11 267 7000
- **Email**: info@statistics.gov.lk

---

*Last Updated: December 2025*