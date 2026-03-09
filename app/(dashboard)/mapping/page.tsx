import db from "@/lib/db";
import MappingClient from "@/components/MappingClient";

export default async function MappingPage() {
    const campuses = db.prepare(`
    SELECT c.*, 
    (SELECT COUNT(*) FROM Department d WHERE d.campusId = c.id) as deptCount,
    (SELECT COUNT(*) FROM Asset a JOIN Department d ON a.currentDepartmentId = d.id WHERE d.campusId = c.id) as assetCount
    FROM Campus c
  `).all() as any[];

    return <MappingClient campuses={campuses} />;
}
