# 2026 progress thermometer update

The thermometer was rebuilt in `index.html`, `style.css`, and `script.js`.

- The tube, bulb, and scale are separate elements, so the outer graphics are never clipped by the liquid container.
- The fill and tick labels both use **`goal` from `data/campaign.json`**. For example, `familiesFed: 168` and `goal: 200` display **84%**. The highest stretch-goal value no longer distorts the primary thermometer.
- Once the total reaches or exceeds the goal, the tube remains 100% full, while the textual counter and percent can continue past the original goal.
- The thermometer automatically resizes for phones. Users who prefer reduced animation will see a static fill.
- The campaign dates are displayed in the `America/New_York` time zone.

## Updating the live progress

Edit the existing `data/campaign.json` values `familiesFed` and `goal`. No HTML/CSS edits are needed for future progress or goal changes. The existing matching-sponsor banner, donation link, and community reach goals remain intact.

## Deploying

Publish the contents of the `luckettsturkeydrive/` directory using the same process as your current site. Preserve `data/campaign.json` and `CNAME` alongside the HTML and CSS. This ZIP excludes historical Git metadata and macOS resource files.
