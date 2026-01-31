/**
 * Resume Type Definitions
 * 
 * This file contains all type definitions related to resume data structure
 * coming from the N8N webhook and used throughout the application.
 * 
 * example
 * 
 * Resume Data: {

  "personal": {

    "name": "Lukas Muster",

    "location": "Vienna, Austria",

    "email": "lukas@burtscher.at",

    "phone": "+431234567890",

    "linkedin": "https://www.linkedin.com/in/lukas-muster"

  },

  "education": [

    {

      "institution": "Georgia Institute of Technology",

      "degree": "Master of Science in Computer Science (Specialization: Machine Learning)",

      "startDate": "Unknown",

      "endDate": "Unknown"

    },

    {

      "institution": "Stanford University",

      "degree": "Bachelor of Science in Mathematical and Computational Science",

      "startDate": "Unknown",

      "endDate": "Unknown"

    }

  ],

  "workExperience": [

    {

      "title": "Senior Lead Software Engineer (Data Science)",

      "company": "Lumina AI",

      "startDate": "2021",

      "endDate": "Present",

      "achievements": [

        "Led the development of a proprietary RAG (Retrieval-Augmented Generation) framework, enhancing response accuracy for over 5 million monthly active users, directly applicable to building multimodal embeddings and advanced ML solutions.",

        "Optimized large-scale model serving using NVIDIA Triton, reducing cloud compute costs by $1.2M annually, demonstrating strong MLOps and model operationalization capabilities.",

        "Designed and implemented a real-time feature store capable of handling high event throughput with sub-10ms latency, crucial for data analysis and experimentation in a production environment."

      ]

    },

    {

      "title": "Machine Learning Engineer",

      "company": "DataStream Systems",

      "startDate": "2018",

      "endDate": "2021",

      "achievements": [

        "Built and maintained automated CI/CD pipelines for ML (MLOps), significantly reducing deployment cycles from weeks to hours, showcasing expertise in model operationalization.",

        "Developed a distributed training wrapper for PyTorch, effectively scaling training across 128 GPUs with linear efficiency, relevant for building complex ML models.",

        "Implemented an anomaly detection engine for financial transactions, blocking $45M in fraudulent activity, demonstrating practical application of supervised ML and data analysis."

      ]

    }

  ],

  "projects": [

    {

      "name": "Autonomous Agent Playground",

      "description": [

        "Developed a personal suite of autonomous agents for calendar scheduling and email filtering, leveraging GPT-4 and local vector storage, directly relevant to multimodal embeddings and advanced ML."

      ]

    },

    {

      "name": "Open-Source Contributor: \"Ghost-Net\"",

      "description": [

        "Contributed to a lightweight neural architecture for edge devices, outperforming MobileNetV3 in latency benchmarks, demonstrating experience with advanced ML architectures and optimization."

      ]

    }

  ],

  "skills": {

    "programmingLanguages": [

      "Python",

      "SQL",

      "Rust",

      "Go",

      "C++"

    ],

    "technologies": [

      "PyTorch",

      "TensorFlow",

      "JAX",

      "Hugging Face",

      "LangChain",

      "Kubernetes",

      "Docker",

      "AWS (SageMaker/Lambda)",

      "Terraform",

      "Ray",

      "Apache Spark",

      "Snowflake",

      "Pinecone (Vector DBs)",

      "dbt",

      "NVIDIA Triton",

      "Pandas",

      "NumPy",

      "Scikit-learn"

    ],

    "tools": []

  }

}
 */

/**
 * Personal information section of a resume
 */
export interface ResumePersonalInfo {
  name?: string;
  location?: string;
  email?: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

/**
 * Education entry in a resume
 */
export interface ResumeEducation {
  institution?: string;
  location?: string;
  degree?: string;
  startDate?: string;
  endDate?: string;
  highlights?: string[];
}

/**
 * Work experience entry in a resume
 */
export interface ResumeWorkExperience {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  achievements?: string[];
}

/**
 * Project entry in a resume
 */
export interface ResumeProject {
  name?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  description?: string[];
}

/**
 * Skills section of a resume
 * Supports categorized skills (e.g., programmingLanguages, technologies, tools)
 * and allows for custom categories via index signature
 */
export interface ResumeSkills {
  programmingLanguages?: string[];
  technologies?: string[];
  tools?: string[];
  [key: string]: string[] | undefined;
}

/**
 * Extracurricular activity entry in a resume
 */
export interface ResumeExtracurricular {
  activity?: string;
  startDate?: string;
  endDate?: string;
  description?: string[];
}

/**
 * Complete resume data structure
 * This is the main type that represents the full resume returned from the webhook
 */
export interface ResumeData {
  personal?: ResumePersonalInfo;
  education?: ResumeEducation[];
  workExperience?: ResumeWorkExperience[];
  projects?: ResumeProject[];
  skills?: ResumeSkills;
  extracurriculars?: ResumeExtracurricular[];
}

/**
 * User information (subset used in resume generation)
 */
export interface ResumeUser {
  id?: number;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  streetAddress: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
  linkedInUrl: string | null;
}

/**
 * Job listing information (subset used in resume generation)
 */
export interface ResumeJob {
  id: number;
  companyName: string;
  companyLogo: string;
  jobTitle: string;
  locationCity: string;
  country: string;
}

/**
 * Complete response from the resume generation webhook
 */
export interface ResumeGenerationResponse {
  ok: boolean;
  webhookStatus: number;
  resumeData?: ResumeData;
  user?: ResumeUser;
  job?: ResumeJob;
  error?: string;
  webhookResponse?: unknown;
}

/**
 * Data structure stored in sessionStorage for resume viewing
 */
export interface ResumeSessionData {
  job: ResumeJob;
  user: ResumeUser;
  resumeData: ResumeData;
}
