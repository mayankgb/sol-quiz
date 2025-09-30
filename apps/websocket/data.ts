import {prisma} from "db/client"

async function main() {
  const userId = '04828f15-fe90-4e93-b87c-88a8407e26c5';

  // --------------- Template 1: JavaScript ---------------
  const jsQuestions = [
    {
      question: 'What is JavaScript primarily used for?',
      correctIndex: 0,
      options: [
        'Web development',
        'Database design',
        'Operating systems',
        'Hardware drivers',
      ],
    },
    {
      question: 'Which company developed JavaScript?',
      correctIndex: 2,
      options: ['Microsoft', 'Apple', 'Netscape', 'Oracle'],
    },
    {
      question: 'Which of these is NOT a JavaScript data type?',
      correctIndex: 3,
      options: ['String', 'Number', 'Boolean', 'Character'],
    },
    {
      question: 'How do you write a comment in JavaScript?',
      correctIndex: 1,
      options: ['<!-- comment -->', '// comment', '/* comment */', '# comment'],
    },
    {
      question: 'Which symbol is used for strict equality in JavaScript?',
      correctIndex: 2,
      options: ['=', '==', '===', '=>'],
    },
  ];

  // --------------- Template 2: Rust ---------------
  const rustQuestions = [
    {
      question: 'What is a key feature of Rust?',
      correctIndex: 1,
      options: [
        'Automatic garbage collection',
        'Memory safety without GC',
        'Purely functional programming',
        'Scripting for browsers',
      ],
    },
    {
      question: 'What command compiles a Rust program?',
      correctIndex: 0,
      options: ['cargo build', 'rust run', 'cargo compile', 'rust build'],
    },
    {
      question: 'What is the default file extension for Rust source files?',
      correctIndex: 2,
      options: ['.rsx', '.rust', '.rs', '.rt'],
    },
    {
      question: 'Which keyword is used to define a constant in Rust?',
      correctIndex: 1,
      options: ['let', 'const', 'mut', 'static'],
    },
    {
      question: 'Rust emphasizes:',
      correctIndex: 0,
      options: [
        'Safety and concurrency',
        'Dynamic typing',
        'Runtime interpretation',
        'JavaScript interoperability',
      ],
    },
  ];

  // helper to convert array to Prisma create format
  const buildQuestions = (questions: any[]) =>
    questions.map((q) => ({
      question: q.question,
      correctIndex: q.correctIndex,
      options: {
        create: q.options.map((opt: string, i: number) => ({
          text: opt,
          index: i,
        })),
      },
    }));

  // ✅ Create Template 1 (JavaScript)
  const template1 = await prisma.template.create({
    data: {
      userId,
      title: 'JavaScript Basics Quiz',
      isCampaign: false,
      isPrivate: false,
      Question: {
        create: buildQuestions(jsQuestions),
      },
    },
    include: {
      Question: { include: { options: true } },
    },
  });

  // ✅ Create Template 2 (Rust)
  const template2 = await prisma.template.create({
    data: {
      userId,
      title: 'Rust Fundamentals Quiz',
      isCampaign: false,
      isPrivate: false,
      Question: {
        create: buildQuestions(rustQuestions),
      },
    },
    include: {
      Question: { include: { options: true } },
    },
  });

  console.log('Created templates successfully!');
  console.log({ javascriptTemplate: template1.id, rustTemplate: template2.id });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
