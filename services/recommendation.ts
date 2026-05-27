import axios from "axios";
import { config } from "@/lib/config";
import { 
  RecommendationRequest, 
  RecommendationResponse 
} from "@/types/recommendation";

const recommendationApi = axios.create({
  baseURL: config.recommendation.baseUrl,
  timeout: config.recommendation.timeout,
});

export const recommendationAPI = {
  getRecommendations: async (params: RecommendationRequest): Promise<RecommendationResponse> => {
    try {
      const response = await recommendationApi.post("/recommend", params);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch job recommendations:", error);
      throw error;
    }
  },
};
