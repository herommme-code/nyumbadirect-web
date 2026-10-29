# Manual location system: Laravel follow-up

The Laravel project is not included in this repository, so no server or database files were changed here. The React frontend remains backward-compatible: it still sends `latitude`, `longitude`, `is_verified`, and the existing location fields, but new area-based listings send `0` for coordinates and use `region`, `district`, `ward`, and optional `landmark`.

Before deploying the frontend change, update the Laravel API as follows:

1. Make `latitude` and `longitude` nullable (or accept `0`) in property validation and database storage. Do not require GPS coordinates to create or publish a property.
2. Require `region`, `district`, and `ward`; keep `landmark` nullable.
3. Do not use GPS presence to decide whether a listing is public. Use the existing active/published status instead.
4. Return `region`, `district`, `ward`, and `landmark` consistently from public and seller listing endpoints. Preserve legacy coordinates when they exist.
5. Add an authoritative area-centre dataset (region/district/ward -> centre latitude/longitude) on the server or in a versioned shared dataset. Return only that area centre for map discovery; never return it as an exact property coordinate.
6. Add server-side filtering/order support for region, district, and ward when ready. The current frontend performs these filters locally, so this can be introduced without a breaking API change.

Suggested migration intent (adapt names to the existing Laravel schema):

```php
Schema::table('properties', function (Blueprint $table) {
    $table->decimal('latitude', 10, 7)->nullable()->change();
    $table->decimal('longitude', 10, 7)->nullable()->change();
    $table->string('landmark')->nullable()->change();
});
```

Test legacy records with exact GPS values, records with `0` coordinates, and newly created manual-area records before production rollout.
