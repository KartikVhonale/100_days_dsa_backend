export function getSystemDesignCurriculum(req, res) {
  // 4-Phase Progression Plan (Weeks 1–8+)
  const progressionPlan = [
    {
      phase: 'Weeks 1–2: The Core Primitives',
      badge: 'Weeks 1–2',
      focus: 'Component Mastery & Operational Costs',
      goal: 'Never study full systems until you understand exactly when and why to use these specific building blocks.',
      topics: [
        {
          name: 'Load Balancing (L4 vs L7)',
          details: 'L4 (Transport/TCP routing via IP/Port, ultra-low latency, unaware of HTTP payloads) vs L7 (Application/HTTP routing, SSL termination, path-based routing, header inspection). Algorithms: Round Robin, Least Connections, Weighted Response Time, Consistent Hash IP affinity.'
        },
        {
          name: 'Database Selection (ACID SQL vs NoSQL)',
          details: 'When to enforce strict ACID transactions (PostgreSQL/MySQL with InnoDB) vs horizontal partition scalability & flexible semi-structured models (Cassandra for write-heavy append logs, DynamoDB for key-value O(1) single-digit ms lookups, MongoDB for nested document trees).'
        },
        {
          name: 'Caching Architecture & Failure Modes',
          details: 'Patterns: Cache-Aside (lazy loading), Write-Through (strong consistency, write latency penalty), Write-Behind (asynchronous, risk of data loss on crash), Write-Around (avoids cache pollution). Catastrophes: Cache Stampede / Thundering Herd (mitigated via Mutex locks or XFetch probabilistic early expiration), Cache Penetration (mitigated by Bloom filters), Cache Avalanche (mitigated by jittered TTLs).'
        },
        {
          name: 'Asynchronous Decoupling (Message Brokers)',
          details: 'Distributed Log (Kafka - ordered partition keys, replayable log retention, pull-based consumer groups) vs Task Queue (RabbitMQ / AWS SQS - push-based, dead letter queues, visibility timeouts). Mandatory: At-least-once delivery requires Idempotency Keys (deduplication table or Redis SETNX).'
        }
      ]
    },
    {
      phase: 'Weeks 3–4: Distributed Theory & Consensus',
      badge: 'Weeks 3–4',
      focus: 'Foundational Trade-Offs & Scaling Patterns',
      goal: 'Articulate trade-offs like a Staff Engineer (L5/L6) under network failures, high concurrency, and data divergence.',
      topics: [
        {
          name: 'CAP Theorem & PACELC',
          details: 'In a Partition (P), choose Consistency (C - reject writes to preserve safety) or Availability (A - accept writes, reconcile divergence later). PACELC extends this: Else (E - no partition), choose Latency (L) vs Consistency (C). DynamoDB defaults to PA/EL; Spanner achieves PC/EC with TrueTime atomic clocks.'
        },
        {
          name: 'Replication & Data Synchronization',
          details: 'Single-Leader (clean ACID writes on primary, replication lag on read replicas), Multi-Leader (geo-distributed low latency writes, requires conflict resolution like Last-Write-Wins or CRDTs), Leaderless (Dynamo style, quorum R + W > N ensures read overlap, anti-entropy Merkle trees for background sync).'
        },
        {
          name: 'Sharding & Horizontal Partitioning',
          details: 'Range-Based (order queries fast, severe hotspotting on monotonic auto-increment IDs) vs Hash-Based (MurmurHash3 / Consistent Hashing ring with 150-250 virtual nodes for even distribution). Cross-shard transactions: Two-Phase Commit (2PC - blocking, high latency) vs Saga Pattern (choreography/orchestration with compensating rollbacks).'
        },
        {
          name: 'Consistency Guarantees',
          details: 'Linearizability / Strict Serializability (global real-time clock order) -> Sequential Consistency -> Causal Consistency -> Read-Your-Writes / Monotonic Reads -> Eventual Consistency.'
        }
      ]
    },
    {
      phase: 'Weeks 5–8: The 5 High-Yield System Archetypes',
      badge: 'Weeks 5–8',
      focus: 'Canonical System Archetypes Covering 90% of Big Tech Prompts',
      goal: 'Map any ambiguous interview question (e.g., "Design TikTok", "Design Robinhood", "Design Yelp") to one of the 5 canonical patterns.',
      topics: [
        {
          name: '1. Heavy Read / Fan-Out (Twitter/X News Feed)',
          details: 'Push vs Pull fan-out, hybrid fanout for celebrity accounts (follower threshold > 25k), Redis timeline sorted sets (ZADD/ZREVRANGEBYSCORE).'
        },
        {
          name: '2. Heavy Write / High Throughput (Metrics & Distributed Logging)',
          details: 'Ingestion buffers with Kafka, batching at client edge, LSM-Tree storage (ClickHouse / TimescaleDB), downsampling rollups.'
        },
        {
          name: '3. Real-Time / Low Latency (WhatsApp & Discord Chat)',
          details: 'Persistent WebSockets, stateful Gateway connection managers, Redis presence hash sets, distributed message routing, Snowflake 64-bit IDs.'
        },
        {
          name: '4. Spatial / Location-Based (Uber & Yelp Proximity)',
          details: 'QuadTrees, Geohash base32 prefix matching, Google S2 hierarchical spatial cells, dynamic driver ephemeral tracking in Redis Geospatial.'
        },
        {
          name: '5. Infrastructure / Foundational (Distributed API Rate Limiter)',
          details: 'Token Bucket vs Sliding Window Counter, atomic Redis Lua scripts to eliminate race conditions, Envoy Edge filters, 429 Retry-After headers.'
        }
      ]
    },
    {
      phase: 'Weeks 9–10: 45-Minute Execution & Mock Loops',
      badge: 'Weeks 9–10',
      focus: 'Time Pacing, Whiteboard Driving & Trade-off Articulation',
      goal: 'Execute with zero hesitation. Drive the conversation, proactively point out SPOFs, explain what breaks at 10x scale.',
      topics: [
        {
          name: 'Pacing Discipline',
          details: '5 min clarify, 3 min math, 10 min high-level, 20 min deep dive, 5 min operational telemetry.'
        },
        {
          name: 'Staff-Level Nuances (L5/L6)',
          details: 'Graceful degradation (shedding non-critical features), Circuit Breakers (Resilience4j), Disaster Recovery (Active-Active multi-region with DNS GSLB failover), Cost Optimization (S3 tiering to Glacier, Spot EC2 for batch processing).'
        }
      ]
    }
  ];

  // The 5 Canonical High-Yield Archetypes with full details
  const archetypes = [
    {
      id: 'heavy-read',
      category: 'Archetype 1: Heavy Read / Fan-Out',
      title: 'Social News Feed & Timeline (Twitter / Instagram / LinkedIn)',
      interviewsMapped: ['Design Twitter Feed', 'Design Instagram', 'Design Facebook News Feed', 'Design LinkedIn Activity Stream'],
      scale: '300M DAU, 500M posts/day, 100:1 to 500:1 Read-to-Write ratio, p99 feed latency < 100ms',
      problemStatement: 'Generating customized, chronologically reverse or algorithmic timelines for hundreds of millions of users with near-zero latency.',
      coreTradeOff: 'Fanout-on-Write (Push model) vs Fanout-on-Read (Pull model). The "Celebrity / Justin Bieber Problem" destroys naive push models.',
      solutionArchitecture: {
        ingestion: 'API Gateway -> Post Service -> Writes metadata to PostgreSQL / CockroachDB -> Emits "PostCreated" event to Kafka topic.',
        fanoutWorker: 'Kafka Consumer Group reads PostCreated event -> Fetches author\'s follower list from Graph DB / Redis cache.',
        hybridFanoutStrategy: 'If user has < 25,000 followers, Push post_id to all followers\' Redis timeline Sorted Sets (ZADD). If user is a Celebrity (> 25k followers), DO NOT push; instead, store post in celebrity table. When a normal user opens feed, execute a lightweight Pull of the few celebrities they follow and merge-sort (k-way merge) on the fly in < 15ms.',
        cachingTier: 'Redis Cluster storing top 800 post IDs per active user (User Timeline cache). Post content stored in Redis String cache (decoupled from feed index). Blobs/Images stored in AWS S3 + CloudFront CDN.'
      },
      failureModes: [
        'Redis timeline cache eviction under high user count (mitigated by LRU + only caching active users within last 3 days).',
        'Celebrity posts causing sudden read spikes on origin databases (mitigated by aggressive read-through CDN caching of celebrity posts).'
      ],
      keyNumbers: 'Read QPS: ~350,000 QPS. Cache memory: 300M DAU * 800 post_ids * 8 bytes ≈ 1.9 TB RAM across Redis cluster.'
    },
    {
      id: 'heavy-write',
      category: 'Archetype 2: Heavy Write / High Throughput',
      title: 'Distributed Metrics & Logging System (Datadog / Prometheus / CloudWatch)',
      interviewsMapped: ['Design Distributed Logging', 'Design Metrics Collection', 'Design Clickstream Tracker', 'Design Telemetry Ingestion'],
      scale: '10 Million data points / sec (~10M Write QPS), 100:1 Write-to-Read ratio, 30-day raw retention, 1-year aggregated retention',
      problemStatement: 'Ingesting massive streams of telemetry logs/metrics from hundreds of thousands of microservice instances with zero data loss and sub-second query latency.',
      coreTradeOff: 'Immediate durability vs Ingestion throughput. Individual DB inserts crash instantly under 10M QPS; batching and Log-Structured Merge (LSM) trees are strictly mandatory.',
      solutionArchitecture: {
        edgeAgents: 'DaemonSet agent (Fluentbit / OpenTelemetry) running on host servers. Buffers logs in memory and flushes in batches of 1,000 events or every 500ms.',
        ingestionLayer: 'Network Load Balancer (NLB - Layer 4) -> Distributed Kafka cluster partitioned by MetricName + TenantID. Handles spikes and isolates slow downstream sinks.',
        processingAndAggregation: 'Apache Flink / Spark Streaming consuming Kafka streams -> Performs sliding-window 1-minute and 5-minute aggregations (sum, count, p50, p95, p99).',
        storageLayer: 'Time-Series DB with LSM-Trees (ClickHouse or Apache Pinot or Cassandra). Writes are sequential append-only to commit log + in-memory MemTable, flushed to disk as immutable SSTables.',
        retentionPolicy: 'Tiered storage: Raw data kept for 7 days in NVMe SSDs -> Rolled up (downsampled to 1h averages) and moved to S3 object storage for 365 days.'
      },
      failureModes: [
        'Kafka consumer lag during traffic surges (mitigated by auto-scaling Flink workers and increasing partition count).',
        'High cardinality explosion (e.g. tagging metrics with random UUIDs blowing up indexing memory). Mitigated by strict metric admission control and rejecting unbounded tag keys.'
      ],
      keyNumbers: 'Ingress bandwidth: 10M events/sec * 200 bytes = 2 GB/sec = 16 Gbps bandwidth. Raw Daily Storage: 10M * 86,400 * 200 bytes ≈ 172 TB / day (down to ~20 TB with zstd compression).'
    },
    {
      id: 'real-time',
      category: 'Archetype 3: Real-Time / Low Latency',
      title: 'Real-Time Messaging & Chat Platform (WhatsApp / Discord / Slack)',
      interviewsMapped: ['Design WhatsApp', 'Design Discord', 'Design Slack', 'Design Live Chat / Customer Support'],
      scale: '500M DAU, 100B messages/day (~1.15M msg/sec peak), message delivery latency < 100ms globally',
      problemStatement: 'Delivering bidirectional, ordered, guaranteed instant messages between users and large group channels with presence status.',
      coreTradeOff: 'HTTP Polling (wasteful, high overhead) vs Long Polling vs Persistent WebSockets (requires stateful connection management and high memory per socket).',
      solutionArchitecture: {
        connectionTier: 'WebSocket Gateway Cluster maintaining stateful, persistent TCP connections with clients. Uses Linux Epoll / Go goroutines (only ~10KB RAM per connection).',
        presenceService: 'Tracks online/offline/last-seen status. Clients send heartbeat ping every 30 seconds. Status stored in Redis with 45-second TTL (automatic expiration if disconnects).',
        sessionRegistry: 'Redis Cluster storing mapping of `UserID -> WebSocket_Gateway_Host_ID`. When a message arrives for User B, Gateway routes it to the specific Gateway server holding User B\'s socket.',
        messageStore: 'ScyllaDB / Apache Cassandra (wide-column store). Primary key = `(conversation_id) PARTITION KEY, (message_id) CLUSTER KEY WITH CLUSTERING ORDER BY message_id ASC`. Append-only writes.',
        idGeneration: 'Twitter Snowflake ID (64-bit: timestamp + datacenter_id + worker_id + sequence_number) ensuring strict time-based sorting without central locks.'
      },
      failureModes: [
        'WebSocket server crash dropping 50,000 connections at once (mitigated by reconnect jitter backoff to prevent Thundering Herd on remaining servers).',
        'Large group message amplification (1 message sent to 10,000 users). Mitigated by RabbitMQ/Kafka fanout exchange with dedicated queue consumers.'
      ],
      keyNumbers: 'Concurrent connections: 500M DAU * 10% concurrent = 50M connections. RAM: 50M * 10KB ≈ 500 GB RAM across Gateway cluster (100 servers with 8GB RAM each).'
    },
    {
      id: 'spatial',
      category: 'Archetype 4: Spatial / Location-Based',
      title: 'Proximity Search & Dynamic Ride Dispatch (Uber / Lyft / Yelp)',
      interviewsMapped: ['Design Uber', 'Design Lyft', 'Design Yelp', 'Design Google Maps Nearby'],
      scale: '50M DAU, 1M active drivers sending GPS every 4 seconds (250,000 Location Writes/sec), rider pickup match latency < 1 sec',
      problemStatement: 'Indexing 2D latitude/longitude coordinates to efficiently query "Find all available drivers within 3 km of my location" with sub-second response times.',
      coreTradeOff: 'Static Spatial Indexing (QuadTree rebuilt periodically - ideal for Yelp restaurants) vs Dynamic Ephemeral Spatial Indexing (Geohash / S2 cells in memory - ideal for moving Uber drivers).',
      solutionArchitecture: {
        driverLocationPipeline: 'Driver app transmits GPS ping (lat, lon, driver_id, status) via WebSocket / gRPC every 4 seconds.',
        spatialHashing: 'Driver coordinates mapped to Geohash (base-32 string, e.g. 6-character geohash covers ~1.2 km x 0.6 km area) or Google S2 cell tokens (64-bit integer, Hilbert curve).',
        locationBuffer: 'Redis Geospatial (GEOADD / GEORADIUS) or in-memory Geohash index. Fast O(log N) radius query. No heavy relational DB writes for ephemeral moving locations.',
        rideMatchingEngine: 'Dispatches ride request by querying current rider\'s Geohash + 8 neighboring Geohash cells. Filters drivers by status=Available, computes ETA using OSRM/Google Directions API.',
        dispatchLocking: 'Distributed lock (Redis Redlock or PostgreSQL SELECT FOR UPDATE) on driver_id to ensure only one rider matches with a given driver.'
      },
      failureModes: [
        'Geohash edge boundary problem: Two objects 5 meters apart across a Geohash boundary have completely different string prefixes. Mitigated by querying all 8 adjacent neighbor cells.',
        'High density surge (e.g. Times Square on New Year\'s Eve). Mitigated by dynamic cell resolution: split into smaller S2 level-15 cells in dense cities, larger level-12 cells in rural areas.'
      ],
      keyNumbers: 'Location Write QPS: 1,000,000 drivers / 4s = 250,000 QPS. Storing 1M drivers in Redis Geospatial = 1M * 64 bytes ≈ 64 MB RAM (extremely lightweight!).'
    },
    {
      id: 'rate-limiter',
      category: 'Archetype 5: Infrastructure / Foundational',
      title: 'Distributed API Rate Limiter & Throttling (Stripe / AWS / Cloudflare)',
      interviewsMapped: ['Design an API Rate Limiter', 'Design Distributed Leaky Bucket', 'Design DDoS Protection Filter', 'Design Tiered API Gateway Throttling'],
      scale: '500,000 QPS across distributed edge clusters, decision latency < 2ms, zero race conditions under concurrent requests',
      problemStatement: 'Protecting downstream microservices from denial-of-service, scraping, and abusive bursts while enforcing tiered tenant quotas (e.g. Tier 1: 100 req/min, Tier 2: 10,000 req/min).',
      coreTradeOff: 'Centralized Redis rate limiter (accurate, shared across all servers, adds 1-2ms network hop) vs Local in-memory rate limiter (0ms latency, but quota split across instances can allow bursts if load balancing is uneven).',
      solutionArchitecture: {
        placement: 'Envoy / Kong API Gateway edge filter executing before requests hit upstream microservices.',
        algorithm: 'Sliding Window Counter: Calculates `Count = current_window_count + previous_window_count * (1 - time_into_current_window / window_size)`. Offers high accuracy with minimal memory (only 2 integer counters per client).',
        atomicExecution: 'Executed via atomic Redis Lua Script (single round-trip to Redis, atomic increment and expiration without distributed locks).',
        responseHeaders: 'HTTP 429 Too Many Requests with headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset-After` (in seconds).',
        fallbackRule: 'If Redis cluster is unreachable, Fail-Open with local in-memory fallback to avoid taking down all production traffic.'
      },
      failureModes: [
        'Redis Lua script execution timeout under massive traffic (mitigated by pipelining or local Token Bucket with periodic batch synchronization to Redis).',
        'Client retry storm on 429 errors (mitigated by enforcing exponential backoff with full jitter on client SDKs).'
      ],
      keyNumbers: 'Memory per user: 20 bytes (Redis key + 2 counters). For 100M active API keys = 100M * 20 bytes ≈ 2 GB RAM. Can easily run in a single small Redis cluster.'
    }
  ];

  // The 45-Minute Execution Framework with explicit timing
  const framework = [
    {
      step: 'Phase 1: Clarify & Scope Requirements',
      duration: '5–8 mins',
      targetMinutes: 7,
      description: 'Never jump straight into drawing boxes. Establish hard boundaries, disambiguate scope, and agree on functional vs non-functional requirements with the interviewer.',
      keyQuestions: [
        'Functional Scope: What are the 2 or 3 core user journeys? What is explicitly out of scope?',
        'Non-Functional SLA: What is the p99 latency target (e.g. < 50ms read, < 200ms write)?',
        'Availability Target: 99.9% (8.7h downtime/yr) vs 99.99% "four nines" (52m downtime/yr)?',
        'Consistency Model: Strong consistency (financial balances) vs Eventual consistency (social feeds)?'
      ],
      antiPatterns: [
        'Assuming scope without asking (e.g. designing both payment processing AND ride dispatch for Uber).',
        'Forgetting to ask about read-to-write ratio.'
      ]
    },
    {
      step: 'Phase 2: Back-of-the-Envelope Estimation',
      duration: '2–3 mins',
      targetMinutes: 3,
      description: 'Derive rough order-of-magnitude hardware constraints to justify data storage, network bandwidth, and memory caches using anchor calculations.',
      keyQuestions: [
        'Traffic Estimation: 1M requests/day = 11.6 ≈ 12 QPS. Peak QPS = Average QPS * 2 to 3.',
        'Storage Estimation: Daily writes * payload size * 365 days * 5-year retention period.',
        'Network Bandwidth: QPS * average response payload size = Ingress & Egress in MB/s or Gbps.',
        'Cache Memory (Pareto 80/20): 20% of daily active requests * payload size = RAM required in Redis.'
      ],
      antiPatterns: [
        'Spending 15 minutes doing overly precise decimal math. Use round powers of 10!',
        'Calculating numbers and then never referencing them later in the architecture.'
      ]
    },
    {
      step: 'Phase 3: High-Level Architecture (HLD)',
      duration: '5–10 mins',
      targetMinutes: 10,
      description: 'Draw the end-to-end data flow from client to storage. Identify microservices, API contracts, and primary databases.',
      keyQuestions: [
        'Client -> DNS / CDN -> Layer 4 / Layer 7 Load Balancer -> API Gateway / Reverse Proxy.',
        'Stateless App Tier: Separation of read and write microservices (CQRS).',
        'Database Tier: Justify relational (PostgreSQL) vs NoSQL (DynamoDB / Cassandra) based on access patterns.',
        'Caching & Decoupling: In-memory cache (Redis) and asynchronous message queues (Kafka / SQS).'
      ],
      antiPatterns: [
        'Dumping 20 microservices onto the board without explaining the data flow.',
        'Making application servers stateful (storing session data in server RAM instead of Redis).'
      ]
    },
    {
      step: 'Phase 4: Detailed Component Deep Dive & Bottlenecks',
      duration: '15–20 mins',
      targetMinutes: 18,
      description: 'This is where L5 and L6 candidates win the interview. Address single points of failure (SPOF), partition strategies, race conditions, and network boundaries.',
      keyQuestions: [
        'Database Sharding: Choose shard key carefully to avoid hot partitions (e.g. hash of user_id + date).',
        'Replication & Failover: Leader-follower replication lag, Quorum reads/writes (R + W > N).',
        'Cache Stampede & Invalidation: Mitigate with Mutex locks or probabilistic early expiration (XFetch).',
        'Asynchronous Processing: Idempotency keys to guarantee at-least-once delivery without duplicate processing.'
      ],
      antiPatterns: [
        'Ignoring edge cases (e.g. what happens when a celebrity posts or a network partition occurs?).',
        'Leaving Single Points of Failure (SPOFs) anywhere in the diagram.'
      ]
    },
    {
      step: 'Phase 5: Operational Excellence & Wrap-up',
      duration: '3–5 mins',
      targetMinutes: 5,
      description: 'Summarize system metrics, acknowledge trade-offs, and suggest operational telemetry and failure mitigation.',
      keyQuestions: [
        'Observability Triad: Metrics (Prometheus), Distributed Tracing (OpenTelemetry / Jaeger), Logging (ELK).',
        'Failure Modes: Circuit breakers (Resilience4j) to prevent cascading failures, rate limiting, and graceful degradation.',
        'Future Scale: What breaks if traffic grows 10x? (e.g. migrate to multi-region active-active).'
      ],
      antiPatterns: [
        'Pretending your system has zero flaws. Interviewers want you to articulate trade-offs candidly!'
      ]
    }
  ];

  // Core Distributed Primitives (Cheat Sheet)
  const cheatSheet = [
    {
      topic: 'Load Balancing: Layer 4 vs Layer 7',
      category: 'Networking',
      takeaway: 'Layer 4 (L4) routes based on TCP/UDP IP and Port with no inspection of packet content (extremely high throughput, ~1M packets/sec). Layer 7 (L7) terminates SSL and inspects HTTP headers, cookies, and URLs (smart routing, rate limiting, cookie sticky sessions, but higher CPU overhead). Use L4 (e.g., AWS NLB) as ingress router to L7 reverse proxies (e.g., Nginx, Envoy, AWS ALB).'
    },
    {
      topic: 'Database Selection: Relational vs NoSQL',
      category: 'Data Persistence',
      takeaway: 'Choose SQL (PostgreSQL, MySQL) when you need strict ACID transactions, complex relational joins, and structured financial balances. Choose NoSQL: Cassandra/ScyllaDB for write-heavy append-only time series; DynamoDB for predictable single-digit ms O(1) key-value access; MongoDB for nested document hierarchies. Never default to SQL "just because"; justify with data volume and access pattern.'
    },
    {
      topic: 'Caching: Aside vs Through vs Behind',
      category: 'Performance',
      takeaway: 'Cache-Aside: App queries cache; on miss, queries DB and populates cache (lazy, optimal for read-heavy). Write-Through: App writes to cache, cache writes synchronously to DB (strong consistency, higher write latency). Write-Behind (Write-Back): App writes to cache, cache writes asynchronously in batches to DB (maximum write throughput, risk of data loss on crash). Avoid Thundering Herd with Mutex locking.'
    },
    {
      topic: 'Message Queues: Kafka vs RabbitMQ vs SQS',
      category: 'Decoupling',
      takeaway: 'Kafka is a distributed append-only commit log with partition ordering, high throughput, and consumer pull-model with message replayability. RabbitMQ is a complex routing broker with exchange bindings, push-model, and dead-letter queues. AWS SQS is a fully managed cloud queue. When you need event streaming and replay, choose Kafka. When you need complex task routing and individual message ACKs, choose RabbitMQ.'
    },
    {
      topic: 'CAP Theorem & PACELC Trade-Off',
      category: 'Distributed Theory',
      takeaway: 'In a distributed network partition (P), choose Consistency (C - reject writes) or Availability (A - accept writes, reconcile later). In normal operation (E - Else), trade off Latency (L) versus Consistency (C). Example: DynamoDB is PA/EL; Google Spanner is PC/EC using atomic atomic GPS clocks.'
    },
    {
      topic: 'Consistent Hashing with Virtual Nodes',
      category: 'Scalability',
      takeaway: 'Maps server nodes and data keys to a 360° circular hash ring (0 to 2^32 - 1). When a server node is added or removed, only K/N keys need remapping (instead of all keys with naive mod N). Adding 100–250 virtual nodes per physical node ensures uniform distribution and prevents uneven hot server allocation.'
    }
  ];

  // Anchor Numbers & Back-of-the-Envelope Guide
  const anchorNumbers = {
    rulesOfThumb: [
      { metric: '1 Million requests / day', equivalent: '~11.6 requests / second (round to 12 QPS)' },
      { metric: '10 Million requests / day', equivalent: '~116 requests / second (round to 120 QPS)' },
      { metric: '100 Million requests / day', equivalent: '~1,160 requests / second (round to 1,200 QPS)' },
      { metric: '1 Billion requests / day', equivalent: '~11,600 requests / second (round to 12,000 QPS)' },
      { metric: 'Peak QPS Rule', equivalent: 'Average QPS * 2 to 3 (or 5 for flash sale/breaking news)' },
      { metric: 'Seconds in a Day', equivalent: '86,400 seconds ≈ 10^5 seconds for fast mental math' },
      { metric: '80/20 Pareto Rule', equivalent: '20% of content generates 80% of read traffic (cache this 20%)' }
    ],
    storageMultipliers: [
      { power: '2^10 bytes', label: '1 Kilobyte (KB)', bytes: '1,024 bytes' },
      { power: '2^20 bytes', label: '1 Megabyte (MB)', bytes: '1,048,576 bytes' },
      { power: '2^30 bytes', label: '1 Gigabyte (GB)', bytes: '1 Billion bytes' },
      { power: '2^40 bytes', label: '1 Terabyte (TB)', bytes: '1 Trillion bytes' },
      { power: '2^50 bytes', label: '1 Petabyte (PB)', bytes: '1 Quadrillion bytes' }
    ],
    latencyReference: [
      { operation: 'L1 Cache Reference', latency: '0.5 ns', humanized: 'Heartbeat of 1 CPU cycle' },
      { operation: 'Branch Mispredict', latency: '5 ns', humanized: '10x slower than L1' },
      { operation: 'L2 Cache Reference', latency: '7 ns', humanized: '14x slower than L1' },
      { operation: 'Main RAM Memory Access', latency: '100 ns', humanized: '200x slower than L1' },
      { operation: 'Read 1 MB Sequentially from RAM', latency: '3,000 ns (3 µs)', humanized: 'Super fast memory copy' },
      { operation: 'NVMe SSD Random Read', latency: '10,000–50,000 ns (10–50 µs)', humanized: '100x slower than RAM' },
      { operation: 'Read 1 MB Sequentially from SSD', latency: '1,000,000 ns (1 ms)', humanized: 'Standard disk transfer' },
      { operation: 'Same Datacenter Roundtrip (LAN)', latency: '500,000 ns (0.5 ms)', humanized: 'Standard intra-cluster hop' },
      { operation: 'Hard Drive (HDD) Seek Time', latency: '10,000,000 ns (10 ms)', humanized: 'Physical mechanical arm movement' },
      { operation: 'Cross-Continental Roundtrip (SF to NY)', latency: '40,000,000 ns (40 ms)', humanized: 'Speed of light in fiber optic' },
      { operation: 'Trans-Atlantic Roundtrip (SF to London)', latency: '100,000,000 ns (100 ms)', humanized: 'Noticeable human lag' }
    ]
  };

  // Case studies legacy alias pointing to archetypes for backwards compatibility
  const caseStudies = archetypes.map(a => ({
    id: a.id,
    title: a.title,
    companyTags: a.interviewsMapped.map(im => im.replace('Design ', '')),
    scale: a.scale,
    coreComponents: [
      a.solutionArchitecture.ingestion || a.solutionArchitecture.connectionTier || a.solutionArchitecture.edgeAgents || a.solutionArchitecture.placement,
      a.solutionArchitecture.fanoutWorker || a.solutionArchitecture.processingAndAggregation || a.solutionArchitecture.sessionRegistry || a.solutionArchitecture.spatialHashing || a.solutionArchitecture.algorithm,
      a.solutionArchitecture.cachingTier || a.solutionArchitecture.storageLayer || a.solutionArchitecture.messageStore || a.solutionArchitecture.locationBuffer || a.solutionArchitecture.atomicExecution
    ].filter(Boolean),
    algorithms: a.solutionArchitecture.hybridFanoutStrategy || a.solutionArchitecture.spatialHashing || a.solutionArchitecture.algorithm || a.solutionArchitecture.idGeneration,
    tradeOffs: a.coreTradeOff,
    architectureHighlights: a.failureModes
  }));

  return res.status(200).json({
    success: true,
    data: {
      progressionPlan,
      archetypes,
      framework,
      cheatSheet,
      anchorNumbers,
      caseStudies
    }
  });
}
