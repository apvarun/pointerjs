window.startOnboardingFlow = function (event) {
  PointerJS.startOnboarding(
    [
      {
        element: '#onb-logo',
        note: "Welcome to LLM Observe!\nMonitor your LLMs in real time. Let's take a quick tour.",
      },
      {
        element: '#onb-dashboard',
        note: 'Navigate your observability dashboard and access all LLM monitoring features here.',
      },
      {
        element: '#onb-employees',
        note: 'See total LLM requests and recent activity at a glance.',
      },
      {
        element: '#onb-new-employees',
        note: 'Track average latency and performance of your LLM endpoints.',
      },
      {
        element: '#onb-satisfaction',
        note: 'Monitor error rates to ensure reliability and fast troubleshooting.',
      },
      {
        element: '#onb-interviews',
        note: 'Review user feedback to improve your LLM experience.',
      },
      {
        element: '#onb-chart',
        note: 'Visualize requests and errors over time for all your models.',
      },
      {
        element: '#onb-today-performance',
        note: 'Analyze token usage and trends for cost and efficiency.',
      },
      {
        element: '#onb-table',
        note: 'Inspect recent LLM requests, latency, and status for quick debugging.',
      },
      {
        element: '#onb-learn-more',
        note: "Click here to learn more about LLM Observe's advanced features!",
      },
    ],
    {
      pointerStyle: 'arrow',
      color: '#B1A2CA',
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      pointerSize: 36,
      animationSpeed: 500,
    },
    event,
  )
}
