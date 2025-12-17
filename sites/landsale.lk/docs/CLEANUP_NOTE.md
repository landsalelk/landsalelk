# Manual Cleanup Required

## Issue
A database with ID `real_estate_platform` was mistakenly created during Teams implementation. This database should be deleted from the Appwrite console.

## Action Required
1. Access your Appwrite console
2. Navigate to the Database section
3. Find the database named "Teams Extended Collection" with ID `real_estate_platform`
4. Delete this database

## Correct Database
The Teams implementation should use the existing database: `osclass_landsale_db`

All Teams collections will be created in the existing `osclass_landsale_db` database as defined in:
- `c:\site\src\lib\appwrite\server.ts`
- `c:\site\src\lib\appwrite\config.ts`

## Collections to Create
The following collections need to be manually created in the `osclass_landsale_db` database:
- `teams_extended`
- `team_memberships_extended`
- `team_listings`
- `team_leads`
- `team_messages`
- `team_analytics`
- `team_wallet`

See `c:\site\docs\architecture\TEAMS_SCHEMA.md` for detailed schema information.