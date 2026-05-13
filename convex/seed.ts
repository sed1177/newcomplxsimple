import { internalMutation } from "./_generated/server";

export const seedAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("tracks").collect();
    if (existing.length > 0) return { message: "Already seeded" };

    const trackIds = await Promise.all([
      ctx.db.insert("tracks", {
        name: "Hardware Fundamentals",
        slug: "hardware",
        description: "Learn about PC components, how they work, and how they connect.",
        color: "#EA580C",
        icon: "cpu",
        order: 1,
        published: true,
      }),
      ctx.db.insert("tracks", {
        name: "AI Fundamentals",
        slug: "ai",
        description: "Explore artificial intelligence, machine learning, and neural networks.",
        color: "#7C3AED",
        icon: "brain",
        order: 2,
        published: true,
      }),
      ctx.db.insert("tracks", {
        name: "Cybersecurity Basics",
        slug: "cybersecurity",
        description: "Understand threats, attacks, and how to stay safe online.",
        color: "#E11D48",
        icon: "shield",
        order: 3,
        published: true,
      }),
      ctx.db.insert("tracks", {
        name: "HTML Fundamentals",
        slug: "html",
        description: "Build your first web pages with HTML tags and structure.",
        color: "#2563EB",
        icon: "code",
        order: 4,
        published: true,
      }),
    ]);

    const [hwId, aiId, csId, htmlId] = trackIds;

    // Hardware lessons
    const hw1 = await ctx.db.insert("lessons", {
      trackId: hwId,
      title: "Introduction to PC Components",
      type: "content",
      order: 1,
      published: true,
      content: JSON.stringify({
        blocks: [
          { type: "heading", content: "What Makes a Computer?" },
          { type: "paragraph", content: "A personal computer (PC) is made up of several key components that work together. Each part has a specific job, and understanding them helps you troubleshoot issues, upgrade your system, and make smart buying decisions." },
          { type: "heading", content: "Core Components" },
          { type: "list", content: "CPU (Central Processing Unit) — the 'brain' of the computer\nGPU (Graphics Processing Unit) — handles visual output\nRAM (Random Access Memory) — short-term memory for running programs\nStorage (SSD/HDD) — long-term memory for saving files\nMotherboard — the main circuit board connecting everything\nPSU (Power Supply Unit) — provides power to all components\nCooling — keeps components from overheating" },
          { type: "paragraph", content: "In the next lessons, we'll dive deeper into each component. When you're ready, try the interactive PC parts game to test your knowledge!" },
        ],
      }),
    });

    const hw2 = await ctx.db.insert("lessons", {
      trackId: hwId,
      title: "The CPU: Brain of Your Computer",
      type: "quiz",
      order: 2,
      published: true,
      content: JSON.stringify({
        blocks: [
          { type: "heading", content: "Understanding the CPU" },
          { type: "paragraph", content: "The CPU (Central Processing Unit) executes instructions and performs calculations. Modern CPUs have multiple cores, allowing them to handle many tasks simultaneously. Key specs include clock speed (GHz), core count, and cache size." },
          { type: "heading", content: "CPU Specs Explained" },
          { type: "list", content: "Clock Speed — how many cycles per second (e.g. 3.5 GHz = 3.5 billion cycles/sec)\nCores — independent processing units within one CPU (2, 4, 8, 16+)\nCache — ultra-fast memory built into the CPU (L1, L2, L3)\nTDP — Thermal Design Power; how much heat it generates" },
        ],
      }),
    });

    await Promise.all([
      ctx.db.insert("quizQuestions", {
        lessonId: hw2,
        question: "What does CPU stand for?",
        options: ["Central Processing Unit", "Computer Power Unit", "Core Processing Utility", "Central Program Unit"],
        correctIndex: 0,
        explanation: "CPU stands for Central Processing Unit — it's the main processor that executes instructions.",
        order: 1,
      }),
      ctx.db.insert("quizQuestions", {
        lessonId: hw2,
        question: "What is 'clock speed' measured in?",
        options: ["Watts", "GHz (Gigahertz)", "GB (Gigabytes)", "MHz per core"],
        correctIndex: 1,
        explanation: "Clock speed is measured in GHz (Gigahertz), representing billions of cycles per second.",
        order: 2,
      }),
      ctx.db.insert("quizQuestions", {
        lessonId: hw2,
        question: "More CPU cores generally means...",
        options: ["Slower performance", "Better multitasking ability", "More storage space", "Higher screen resolution"],
        correctIndex: 1,
        explanation: "More cores allow the CPU to handle more tasks simultaneously, improving multitasking.",
        order: 3,
      }),
    ]);

    const hw3 = await ctx.db.insert("lessons", {
      trackId: hwId,
      title: "PC Parts Interactive Game",
      type: "game",
      order: 3,
      published: true,
      content: JSON.stringify({
        blocks: [
          { type: "heading", content: "PC Parts Challenge" },
          { type: "paragraph", content: "Drag each label to the correct component on the diagram. Get them all right to complete this lesson!" },
        ],
      }),
    });

    // AI lessons
    const ai1 = await ctx.db.insert("lessons", {
      trackId: aiId,
      title: "What is Artificial Intelligence?",
      type: "content",
      order: 1,
      published: true,
      content: JSON.stringify({
        blocks: [
          { type: "heading", content: "Artificial Intelligence 101" },
          { type: "paragraph", content: "Artificial Intelligence (AI) refers to systems that simulate human intelligence — learning, reasoning, problem-solving, and understanding language. AI is already part of your daily life: recommendations on Netflix, voice assistants, spam filters, and autocomplete." },
          { type: "heading", content: "Types of AI" },
          { type: "list", content: "Narrow AI — designed for one specific task (e.g. image recognition)\nGeneral AI — hypothetical AI with human-like reasoning (doesn't exist yet)\nMachine Learning — AI that learns from data without explicit programming\nDeep Learning — ML using neural networks with many layers" },
          { type: "paragraph", content: "AI is transforming every industry — from healthcare to transportation. Understanding its basics is an essential skill for the future." },
        ],
      }),
    });

    const ai2 = await ctx.db.insert("lessons", {
      trackId: aiId,
      title: "Machine Learning Basics",
      type: "quiz",
      order: 2,
      published: true,
      content: JSON.stringify({
        blocks: [
          { type: "heading", content: "How Does Machine Learning Work?" },
          { type: "paragraph", content: "Machine Learning (ML) trains algorithms on data so they can make predictions or decisions. Instead of writing explicit rules, you give the model examples and it learns patterns on its own." },
          { type: "list", content: "Supervised Learning — learns from labeled data (input → correct output)\nUnsupervised Learning — finds patterns in unlabeled data\nReinforcement Learning — learns by trial and error, rewarded for correct actions" },
        ],
      }),
    });

    await Promise.all([
      ctx.db.insert("quizQuestions", {
        lessonId: ai2,
        question: "What is Machine Learning?",
        options: ["Programming computers with explicit rules", "AI that learns patterns from data", "A type of computer hardware", "A programming language"],
        correctIndex: 1,
        explanation: "Machine Learning allows AI to learn from data rather than following hardcoded rules.",
        order: 1,
      }),
      ctx.db.insert("quizQuestions", {
        lessonId: ai2,
        question: "In supervised learning, training data is...",
        options: ["Unlabeled", "Labeled with correct answers", "Random noise", "Collected from social media only"],
        correctIndex: 1,
        explanation: "Supervised learning uses labeled data where each input has a known correct output.",
        order: 2,
      }),
      ctx.db.insert("quizQuestions", {
        lessonId: ai2,
        question: "Which type of ML learns through trial and error with rewards?",
        options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Transfer Learning"],
        correctIndex: 2,
        explanation: "Reinforcement Learning agents learn by receiving rewards for correct actions.",
        order: 3,
      }),
    ]);

    // Cybersecurity lessons
    const cs1 = await ctx.db.insert("lessons", {
      trackId: csId,
      title: "Introduction to Cybersecurity",
      type: "content",
      order: 1,
      published: true,
      content: JSON.stringify({
        blocks: [
          { type: "heading", content: "Why Cybersecurity Matters" },
          { type: "paragraph", content: "Cybersecurity is the practice of protecting computers, networks, and data from unauthorized access, damage, or attacks. With billions of devices connected online, understanding security is critical for everyone — not just IT professionals." },
          { type: "heading", content: "The CIA Triad" },
          { type: "list", content: "Confidentiality — keeping data private and accessible only to authorized users\nIntegrity — ensuring data is accurate and hasn't been tampered with\nAvailability — making sure systems are accessible when needed" },
          { type: "paragraph", content: "Every security decision can be evaluated against the CIA Triad. Strong passwords protect confidentiality. Checksums verify integrity. Backups ensure availability." },
        ],
      }),
    });

    const cs2 = await ctx.db.insert("lessons", {
      trackId: csId,
      title: "Common Cyber Threats",
      type: "quiz",
      order: 2,
      published: true,
      content: JSON.stringify({
        blocks: [
          { type: "heading", content: "Know Your Threats" },
          { type: "paragraph", content: "Attackers use various techniques to compromise systems. Knowing these threats is the first step to defending against them." },
          { type: "list", content: "Phishing — fake emails/sites tricking you into revealing credentials\nMalware — malicious software (viruses, ransomware, spyware)\nDDoS — flooding a server with traffic to take it offline\nMan-in-the-Middle — intercepting communication between two parties\nSQL Injection — inserting malicious code into database queries" },
        ],
      }),
    });

    await Promise.all([
      ctx.db.insert("quizQuestions", {
        lessonId: cs2,
        question: "What is phishing?",
        options: ["A fishing technique", "Fake messages tricking users into revealing credentials", "A type of encryption", "Network monitoring software"],
        correctIndex: 1,
        explanation: "Phishing uses deceptive emails or websites to steal credentials or personal information.",
        order: 1,
      }),
      ctx.db.insert("quizQuestions", {
        lessonId: cs2,
        question: "What does DDoS stand for?",
        options: ["Direct Data Over Security", "Distributed Denial of Service", "Dynamic Domain of Systems", "Digital Defense Operations System"],
        correctIndex: 1,
        explanation: "DDoS (Distributed Denial of Service) overwhelms a server with traffic to make it unavailable.",
        order: 2,
      }),
      ctx.db.insert("quizQuestions", {
        lessonId: cs2,
        question: "SQL Injection attacks target...",
        options: ["Network cables", "Database queries", "User passwords only", "Browser extensions"],
        correctIndex: 1,
        explanation: "SQL Injection inserts malicious SQL code into database queries to manipulate or steal data.",
        order: 3,
      }),
    ]);

    // HTML lessons
    const html1 = await ctx.db.insert("lessons", {
      trackId: htmlId,
      title: "What is HTML?",
      type: "content",
      order: 1,
      published: true,
      content: JSON.stringify({
        blocks: [
          { type: "heading", content: "HTML: The Language of the Web" },
          { type: "paragraph", content: "HTML (HyperText Markup Language) is the standard language for creating web pages. It uses tags to define the structure and content of a page. Every website you visit is built with HTML at its core." },
          { type: "heading", content: "Basic HTML Structure" },
          { type: "code", content: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Page</title>\n  </head>\n  <body>\n    <h1>Hello, World!</h1>\n    <p>This is a paragraph.</p>\n  </body>\n</html>" },
          { type: "paragraph", content: "The DOCTYPE declaration tells the browser this is HTML5. The <html> tag wraps everything. <head> contains metadata. <body> contains what's visible on the page." },
        ],
      }),
    });

    const html2 = await ctx.db.insert("lessons", {
      trackId: htmlId,
      title: "HTML Tags and Elements",
      type: "quiz",
      order: 2,
      published: true,
      content: JSON.stringify({
        blocks: [
          { type: "heading", content: "Common HTML Tags" },
          { type: "paragraph", content: "HTML elements are defined by opening tags (<tag>) and closing tags (</tag>). Some elements are self-closing like <img> and <br>." },
          { type: "list", content: "<h1> to <h6> — headings (h1 is largest)\n<p> — paragraph\n<a href='...'> — hyperlink\n<img src='...'> — image\n<ul> / <ol> — unordered / ordered list\n<li> — list item\n<div> — container/block\n<span> — inline container" },
        ],
      }),
    });

    await Promise.all([
      ctx.db.insert("quizQuestions", {
        lessonId: html2,
        question: "Which tag creates the largest heading?",
        options: ["<h6>", "<heading>", "<h1>", "<title>"],
        correctIndex: 2,
        explanation: "<h1> is the largest heading. Headings go from <h1> (largest) to <h6> (smallest).",
        order: 1,
      }),
      ctx.db.insert("quizQuestions", {
        lessonId: html2,
        question: "What does the <a> tag create?",
        options: ["An image", "A heading", "A hyperlink", "A list"],
        correctIndex: 2,
        explanation: "The <a> (anchor) tag creates hyperlinks. Use href='url' to specify the destination.",
        order: 2,
      }),
      ctx.db.insert("quizQuestions", {
        lessonId: html2,
        question: "Which tag is used for an unordered (bullet) list?",
        options: ["<ol>", "<ul>", "<list>", "<bl>"],
        correctIndex: 1,
        explanation: "<ul> creates an unordered list with bullet points. <ol> creates a numbered (ordered) list.",
        order: 3,
      }),
    ]);

    return { message: "Seeded successfully!", tracks: trackIds.length };
  },
});
