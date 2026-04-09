import { Section, SectionItem } from "@/types/cv";

/**
 * Recursively extracts and concatenates text from SectionItem and its children
 */
const extractTextFromItems = (items: SectionItem[]): string => {
  if (!items || items.length === 0) return "";

  return items
    .map((item) => {
      const currentText = item.text || "";
      const childrenText = item.children ? extractTextFromItems(item.children) : "";
      return `${currentText} ${childrenText}`.trim();
    })
    .join("\n")
    .trim();
};

/**
 * Extracts plain text from a specific CV section by its ID
 */
export const extractTextFromSection = (
  sections: Section[],
  sectionId: string
): string => {
  const section = sections.find((s) => s.id === sectionId);
  if (!section || !section.items) return "";

  return extractTextFromItems(section.items);
};

/**
 * Maps CV sections to the format expected by the Recommendation API
 */
export const prepareRecommendationPayload = (
  userId: string,
  sections: Section[],
  candidateCity: string = "Đà Nẵng",
  topN: number = 10
) => {
  return {
    user_id: userId,
    cv_title: extractTextFromSection(sections, "about") || "Hồ sơ cá nhân",
    cv_tech: extractTextFromSection(sections, "skills"),
    cv_mota: extractTextFromSection(sections, "experience"),
    candidate_city: candidateCity,
    top_n: topN,
  };
};
