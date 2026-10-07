# Annual Turkey Drive Update

For normal updates, edit only `campaign.json`.

## At the start of each year
Change:
- `year`
- `launchDate`
- `endDate`
- `familiesFed` back to `0`
- `goal` if needed
- `dollarsPerFamily` if needed
- `donationUrl` if the PTA creates a new Givebacks item
- `driveMessage`
- `preLaunchMessage`
- `postDriveMessage`
- `previousYearImpact`
- `reachGoals` if incentives change

## During the drive
Usually you only need to change:
- `familiesFed`
- `driveMessage` for a current announcement
- `matching.active`, `matching.message`, and `matching.endDate` when a sponsor match is running

Dates should use ISO format with the local UTC offset, for example:
`2026-10-19T00:00:00-04:00`
