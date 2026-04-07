# Image Manifest - Stone Reference Downloads

Date: 2026-04-05
Purpose: Local reference images for AI prompt attachment accuracy.

| Stone | Stone Code | Source URL | Local Path | Status |
| --- | --- | --- | --- | --- |
| Atlantis | PV1016 | https://acstone.com.au/wp-content/uploads/2025/03/AC1016-0-0-1-1.jpg | docs/image_temp/2026-04-05-PV1016-reference.jpg | pending download script run |
| Dolomite | PV6010 | https://acstone.com.au/wp-content/uploads/2024/10/AC6010-0-1-1.jpg | docs/image_temp/2026-04-05-PV6010-reference.jpg | pending download script run |
| Magma Gold | PV1015 | https://acstone.com.au/wp-content/uploads/2025/03/AC1015-0-1-2.jpg | docs/image_temp/2026-04-05-PV1015-reference.jpg | pending download script run |
| Amazonite | PV1017 | https://acstone.com.au/wp-content/uploads/2025/03/AC1017-0-0-1-2.jpg | docs/image_temp/2026-04-05-PV1017-reference.jpg | pending download script run |
| Opal | PV0806 | https://acstone.com.au/wp-content/uploads/2020/10/AC0806N.jpg | docs/image_temp/2026-04-05-PV0806-reference.jpg | pending download script run |

## Download Command

From repository root, run:

```powershell
powershell -ExecutionPolicy Bypass -File docs/image_temp/download-reference-images.ps1
```

To refresh existing files:

```powershell
powershell -ExecutionPolicy Bypass -File docs/image_temp/download-reference-images.ps1 -Overwrite
```
