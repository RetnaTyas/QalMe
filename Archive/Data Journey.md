# Enhanced Data Journey - E.C.M Architecture

## 📂 Folder Structure



---

## 🧠 Advanced Multi-Phase Reasoning Pipeline

### Enhanced Architecture Overview

```mermaid

graph TB

    A[User Query] --> B{Query Classification}

    B -->|Simple| C[Standard Search Flow]

    B -->|Complex| D[Reasoning Pipeline Entry]

    B -->|Critical| E[Multi-Agent Consensus]

    

    D --> F[RAG Context Retrieval]

    F --> G[Phase 1: Initial Execution]

    G --> H[Phase 2: Reflection Analysis]

    H --> I[Phase 3: Context-Aware Revision]

    I --> J[Phase 4: Final Evaluation]

    J --> K[Phase 5: Consensus Validation]

    

    E --> L[Parallel Agent Execution]

    L --> M[Consensus Algorithm]

    M --> N[Final Response]

    

    C --> O[Stream Response]

    K --> P[Structured Response]

    N --> P

```

## 🔄 Enhanced Data Flow Architecture

### 1. **Query Classification & Routing**

```typescript

// Enhanced query classification at entry point

async function classifyQuery(query: string): Promise<QueryClassification> {

  const classification = await runClassificationAssistant(query)

  return {

    complexity: 'simple' | 'complex' | 'critical',

    domain: string[],

    requiresRAG: boolean,

    requiresConsensus: boolean,

    confidenceThreshold: number

  }

}

```

**Data Flow:**

1. **Query Entry** → `app/api/chat/route.ts` atau `app/reasoning-pipeline/route.ts`

2. **Classification** → Determines routing strategy

3. **Context Preparation** → RAG retrieval if needed

4. **Pipeline Selection** → Standard/Enhanced/Multi-Agent

### 2. **RAG Integration Layer**

```typescript

// RAG context retrieval before each phase

async function retrieveRAGContext(query: string, phase: string): Promise<RAGContext> {

  const vectorStore = await getVectorStore() // Weaviate/Pinecone

  const relevantDocs = await vectorStore.similaritySearch(query, {

    k: 10,

    filter: { phase, relevance_threshold: 0.7 }

  })

  

  return {

    documents: relevantDocs,

    metadata: { phase, timestamp: new Date() },

    confidence: calculateConfidence(relevantDocs)

  }

}

```

**Enhanced Data Journey:**

```

User Query → Query Classification → RAG Retrieval → Phase Execution

     ↓

Context Database (Vector Store) → Relevant Documents → Injected into Prompts

```

### 3. **Multi-Agent Consensus Architecture**

```typescript

// Parallel execution with multiple agents

async function runMultiAgentConsensus(prompt: string): Promise<ConsensusResult> {

  const agents = [

    { id: 'logical', assistant: logicalReasoningAssistant },

    { id: 'creative', assistant: creativeThinkingAssistant },

    { id: 'critical', assistant: criticalAnalysisAssistant }

  ]

  

  // Parallel execution

  const results = await Promise.all(

    agents.map(agent => runExecutionAssistant(agent.assistant, prompt))

  )

  

  // Consensus algorithm

  const consensus = await runConsensusAssistant({

    responses: results,

    weights: { logical: 0.4, creative: 0.3, critical: 0.3 }

  })

  

  return consensus

}

```

### 4. **Enhanced Pipeline Phases**

#### **Phase 1: Context-Aware Initial Execution**

```

RAG Context + User Query → Execution Assistant → Contextual Response

```

**Data Path:**

- `retrieveRAGContext(query, 'initial')` → Context documents

- Context + Query → Enhanced prompt template

- Execution Assistant → Initial response with context

#### **Phase 2: Multi-Dimensional Reflection**

```

Initial Response → [Logic Checker, Bias Detector, Fact Verifier] → Comprehensive Analysis

```

**Data Path:**

- Initial response → Multiple reflection agents (parallel)

- Logic integrity check → Logical consistency score

- Bias detection → Bias assessment report

- Fact verification → Factual accuracy score

#### **Phase 3: RAG-Enhanced Revision**

```

Reflection Results + Additional Context → Execution Assistant → Improved Response

```

**Data Path:**

- Reflection feedback → Context retrieval for gaps

- Additional RAG context → Knowledge augmentation

- Revised prompt → Final execution assistant

#### **Phase 4: Comprehensive Evaluation**

```

Final Response → [Integrity Scorer, Quality Assessor, Confidence Estimator] → Multi-Metric Evaluation

```

#### **Phase 5: Consensus Validation (NEW)**

```

Final Response → Multiple Validator Agents → Consensus Score → Accept/Reject/Revise

```

### 5. **Dynamic Context Management**

```typescript

// Context state management across phases

class ContextManager {

  private phaseContext: Map<string, any> = new Map()

  private globalContext: RAGContext

  

  async updateContext(phase: string, data: any) {

    this.phaseContext.set(phase, {

      ...this.phaseContext.get(phase),

      ...data,

      timestamp: new Date()

    })

    

    // Update vector store with learned context

    await this.persistContext(phase, data)

  }

  

  getFullContext(): ComprehensiveContext {

    return {

      global: this.globalContext,

      phases: Object.fromEntries(this.phaseContext),

      metadata: this.generateMetadata()

    }

  }

}

```

### 6. **Enhanced Response Structure**

```typescript

interface EnhancedPipelineResponse {

  success: boolean

  query_classification: QueryClassification

  rag_context: RAGContext

  

  // Multi-phase results

  phases: {

    initial_execution: PhaseResult

    multi_reflection: MultiReflectionResult

    rag_revision: PhaseResult

    comprehensive_evaluation: EvaluationResult

    consensus_validation: ConsensusResult

  }

  

  // Final outputs

  final_response: string

  confidence_metrics: {

    overall_confidence: number

    integrity_score: number

    consensus_score: number

    rag_relevance: number

  }

  

  // Learning data

  correction_feedback?: CorrectionData

  improvement_suggestions: string[]

  

  // Metadata

  metadata: {

    requestId: string

    timestamp: string

    execution_time: number

    phases_completed: number

    agents_used: string[]

    context_sources: string[]

  }

}

```

### 7. **Continuous Learning Loop**

```typescript

// Enhanced correction handler with learning

async function handleEnhancedCorrection(

  query: string,

  response: string,

  userCorrection: string,

  pipeline_metadata: any

) {

  // Store correction in vector database

  await vectorStore.addDocuments([{

    content: `Query: ${query}\nResponse: ${response}\nCorrection: ${userCorrection}`,

    metadata: {

      type: 'correction',

      confidence_score: pipeline_metadata.confidence_metrics.overall_confidence,

      timestamp: new Date()

    }

  }])

  

  // Update model weights based on correction

  await updateAgentWeights(pipeline_metadata.agents_used, userCorrection)

  

  // Generate improvement suggestions

  const improvements = await generateImprovementSuggestions(

    query, response, userCorrection

  )

  

  return improvements

}

```

## 🔍 Decision Tree Enhancement

```

User Query

    ├── Complexity Analysis

    │   ├── Simple (< 0.3) → Standard Search Flow

    │   ├── Complex (0.3-0.7) → Enhanced Pipeline (5 phases)

    │   └── Critical (> 0.7) → Multi-Agent Consensus + Pipeline

    │

    ├── Domain Analysis

    │   ├── Technical → Specialist agent pool

    │   ├── Creative → Creative reasoning agents

    │   └── Analytical → Logic-focused agents

    │

    ├── Context Requirements

    │   ├── Requires RAG → Vector store retrieval

    │   ├── Real-time data → Web search integration

    │   └── Historical → Archive retrieval

    │

    └── Quality Requirements

        ├── High stakes → Multi-agent consensus

        ├── Standard → Single agent pipeline

        └── Exploratory → Creative agent emphasis

```

## 🗄️ Enhanced Data Persistence

### **Vector Store Schema (Weaviate/Pinecone)**

```json

{

  "class": "ReasoningContext",

  "properties": {

    "content": "text",

    "query_type": "string",

    "phase": "string",

    "confidence_score": "number",

    "agent_id": "string",

    "correction_applied": "boolean",

    "improvement_score": "number",

    "timestamp": "date"

  }

}

```

### **PostgreSQL Schema Enhancement**

```sql

-- Enhanced chat history with pipeline metadata

ALTER TABLE chat_history ADD COLUMN pipeline_metadata JSONB;

ALTER TABLE chat_history ADD COLUMN confidence_scores JSONB;

ALTER TABLE chat_history ADD COLUMN rag_context JSONB;

-- Correction tracking

CREATE TABLE correction_feedback (

  id SERIAL PRIMARY KEY,

  chat_id UUID REFERENCES chat_history(id),

  original_response TEXT,

  user_correction TEXT,

  improvement_score FLOAT,

  applied_at TIMESTAMP DEFAULT NOW()

);

```

## 📊 Monitoring & Observability

### **Enhanced Logging Structure**

```typescript

// Comprehensive logging per phase

const logger = {

  phase: (phase: string, data: any) => {

    console.log(`[PHASE-${phase}] ${JSON.stringify({

      timestamp: new Date().toISOString(),

      phase,

      data,

      memory_usage: process.memoryUsage(),

      execution_time: performance.now()

    })}`)

  },

  

  consensus: (agents: string[], results: any[]) => {

    console.log(`[CONSENSUS] ${JSON.stringify({

      agents,

      results_summary: results.map(r => r.confidence),

      consensus_reached: results.every(r => r.confidence > 0.7)

    })}`)

  }

}

```

Arsitektur enhanced ini memberikan:

- **Intelligent routing** berdasarkan query complexity

- **Context-aware reasoning** dengan RAG integration

- **Multi-agent consensus** untuk critical decisions

- **Continuous learning** dari user corrections

- **Comprehensive evaluation** dengan multiple metrics

- **Scalable architecture** untuk production deployment
