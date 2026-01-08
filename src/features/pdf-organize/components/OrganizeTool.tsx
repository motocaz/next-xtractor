"use client";

import { useOrganize } from "../hooks/useOrganize";
import { PageOrganizerTool } from "@/components/common/PageOrganizerTool";

export const OrganizeTool = () => {
  const hookReturn = useOrganize();

  return (
    <PageOrganizerTool
      title="Organize PDF"
      description="Reorder or delete pages with a simple drag-and-drop interface. Drag pages to reorder them, or use the delete button to remove pages."
      instructions="Drag pages to reorder • Click × to delete"
      buttonText="Save Changes"
      hookReturn={hookReturn}
    />
  );
};
