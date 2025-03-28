document.addEventListener("DOMContentLoaded", function () {
  // Get elements
  const commandInput = document.getElementById("command-input");
  const terminalContent = document.querySelector(".terminal-content");
  const commandsHistory = document.querySelector(".commands-history");
  const moduleWindow = document.getElementById("module-window");
  const moduleContentContainer = document.querySelector(
    ".module-content-container"
  );
  const moduleTitle = document.querySelector(".module-title");
  const closeModuleBtn = document.getElementById("close-module");
  const commandItems = document.querySelectorAll(".command-item");

  // Terminal history
  const history = [];
  let historyIndex = -1;

  // Add event listener for command input
  commandInput.addEventListener("keydown", function (event) {
    // Check if Enter key is pressed
    if (event.key === "Enter") {
      event.preventDefault();

      // Get command
      const command = commandInput.value.trim().toLowerCase();

      // Add to history if not empty
      if (command) {
        history.unshift(command);
        historyIndex = -1;

        // Process command
        processCommand(command);
      }

      // Clear input
      commandInput.value = "";
    }

    // Up arrow for history
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        historyIndex++;
        commandInput.value = history[historyIndex];
      }
    }

    // Down arrow for history
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        commandInput.value = history[historyIndex];
      } else if (historyIndex === 0) {
        historyIndex = -1;
        commandInput.value = "";
      }
    }
  });

  // Add click event to commands in the sidebar
  commandItems.forEach((item) => {
    item.addEventListener("click", function () {
      const commandText = item.querySelector(".command").textContent;
      commandInput.value = commandText;
      commandInput.focus();
    });
  });

  // Quiz functionality
  const submitQuizBtn = document.getElementById("submit-quiz");
  const quizResults = document.getElementById("quiz-results");
  const scoreDisplay = document.getElementById("score-display");
  const passMessage = document.getElementById("pass-message");
  const failMessage = document.getElementById("fail-message");

  // Correct answers for the quiz
  const correctAnswers = {
    q1: "c", // bcrypt with salt
    q2: "a", // environment variables
    q3: "c", // parameterized query
    q4: "c", // escape output and CSP
    q5: "c", // HttpOnly cookies and CSRF tokens
  };

  // Add event listener for quiz submission
  if (submitQuizBtn) {
    submitQuizBtn.addEventListener("click", () => {
      let score = 0;

      // Check each answer
      Object.keys(correctAnswers).forEach((question) => {
        const selectedAnswer = document.querySelector(
          `input[name="${question}"]:checked`
        );
        if (
          selectedAnswer &&
          selectedAnswer.value === correctAnswers[question]
        ) {
          score++;
        }
      });

      // Calculate percentage
      const percentage = (score / Object.keys(correctAnswers).length) * 100;

      // Display results
      quizResults.style.display = "block";
      scoreDisplay.textContent = `You scored ${score}/5 (${percentage}%)`;

      // Show pass/fail message
      if (percentage >= 80) {
        passMessage.style.display = "block";
        failMessage.style.display = "none";
      } else {
        passMessage.style.display = "none";
        failMessage.style.display = "block";
      }

      // Add to command history
      const resultMessage = `Quiz completed! Score: ${score}/5 (${percentage}%)`;
      addCommandToHistory("trivia quiz");
      addResponseToHistory(resultMessage);
    });
  }

  // Process commands
  function processCommand(command) {
    // Add command to terminal history
    addCommandToHistory(command);

    // Process commands
    switch (command) {
      case "help":
        displayModule("help-module", "Help: Available Commands");
        break;
      case "secrets":
        displayModule("secrets-module", "Protect Your Secrets");
        break;
      case "injection":
        displayModule("injection-module", "SQL Injections: Close The Door");
        break;
      case "xss":
        displayModule("xss-module", "Cross-Site Scripting Defense");
        break;
      case "auth":
        displayModule("auth-module", "Authentication Fortress");
        break;
      case "deps":
        displayModule("deps-module", "Dependency Defense");
        break;
      case "headers":
        displayModule("headers-module", "HTTP Headers Shield");
        break;
      case "tools":
        displayModule("tools-module", "Security Toolkit");
        break;
      case "owasp":
        displayModule("owasp-module", "OWASP Top 10 Breakdown");
        break;
      case "about":
        displayModule("about-module", "About This Terminal");
        break;
      case "clear":
        clearTerminal();
        break;
      case "matrix":
        addCommandResponse("Wake up, vibe coder...");
        document.body.style.color = "#00ff00";
        setTimeout(() => {
          document.body.style.color = "#33ff33";
        }, 5000);
        break;
      case "sudo":
        addCommandResponse(
          "Nice try, hacker. But there's no sudo in the vibe zone!"
        );
        break;
      case "hack":
        addCommandResponse("Ethical hacking only in this terminal, please!");
        break;
      case "password":
        addCommandResponse(
          "All your passwords should be at least as secure as: correcthorsebatterystaple"
        );
        break;
      case "coffee":
        addCommandResponse("☕ Brewing some secure code with your coffee...");
        break;
      case "trivia":
        const randomTrivia =
          securityTrivia[Math.floor(Math.random() * securityTrivia.length)];
        addCommandResponse(`🔐 SECURITY TRIVIA: ${randomTrivia}`);
        break;
      case "":
        // Do nothing for empty command
        break;
      default:
        addCommandResponse(
          `Command not found: ${command}. Type 'help' to see available commands.`,
          true
        );
        break;
    }

    // Only scroll to bottom if we're not displaying a module
    if (
      ![
        "help",
        "secrets",
        "injection",
        "xss",
        "auth",
        "deps",
        "headers",
        "tools",
        "owasp",
        "about",
        "trivia",
      ].includes(command)
    ) {
      terminalContent.scrollTop = terminalContent.scrollHeight;
    }
  }

  // Add command to terminal history
  function addCommandToHistory(command) {
    const commandLine = document.createElement("div");
    commandLine.classList.add("command-history-item");
    commandLine.innerHTML = `
        <div class="command-prompt">root@vibesec:~$</div>
        <div>${command}</div>
      `;
    commandsHistory.appendChild(commandLine);
  }

  // Add response to a command
  function addCommandResponse(message, isError = false) {
    const responseElement = document.createElement("div");
    responseElement.classList.add("command-response");

    if (isError) {
      responseElement.innerHTML = `<p style="color: #ff5f56;">${message}</p>`;
    } else {
      responseElement.innerHTML = `<p>${message}</p>`;
    }

    commandsHistory.appendChild(responseElement);
  }

  // Display a module in the module window
  function displayModule(moduleId, title) {
    // Get the module content
    const originalModule = document.getElementById(moduleId);

    if (originalModule) {
      // Update the module window title
      moduleTitle.textContent = title;

      // Clear previous content
      moduleContentContainer.innerHTML = "";

      // Clone the module content and add to the window
      const moduleContent = originalModule.querySelector(".module-content");
      const clonedContent = moduleContent.cloneNode(true);

      // Update header to match title if it's different
      const headerElement = originalModule.querySelector(".module-header");
      if (headerElement) {
        const clonedHeader = headerElement.cloneNode(true);
        clonedHeader.classList.add("typing");
        moduleContentContainer.appendChild(clonedHeader);
      }

      moduleContentContainer.appendChild(clonedContent);

      // Show the module window with a fade-in effect
      moduleWindow.style.opacity = "0";
      moduleWindow.style.display = "block";

      setTimeout(() => {
        moduleWindow.style.opacity = "1";
        moduleWindow.style.transition = "opacity 0.3s ease-in-out";
      }, 50);
    }
  }

  // Clear terminal history
  function clearTerminal() {
    commandsHistory.innerHTML = "";
    addCommandResponse("Terminal cleared.");
  }

  // Close module window when clicking the close button
  closeModuleBtn.addEventListener("click", function () {
    moduleWindow.style.opacity = "0";

    setTimeout(() => {
      moduleWindow.style.display = "none";
    }, 300);
  });

  // Simulate terminal boot sequence
  function simulateTerminalBoot() {
    const welcomeText = document.querySelector(".welcome-text");
    const lines = welcomeText.querySelectorAll("p");

    // Hide all lines initially
    lines.forEach((line) => {
      line.style.opacity = "0";
    });

    // Show lines sequentially
    lines.forEach((line, index) => {
      setTimeout(() => {
        line.style.opacity = "1";
        line.classList.add("typing");
        // If it's the last line, add blinking cursor
        if (index === lines.length - 1) {
          setTimeout(() => {
            // Focus on input after boot sequence
            commandInput.focus();
          }, 1000);
        }
      }, (index + 1) * 1000);
    });
  }

  // Set focus on command input when clicking the terminal
  document.querySelector(".terminal").addEventListener("click", function () {
    commandInput.focus();
  });

  // Implement terminal boot sequence
  simulateTerminalBoot();

  // Add terminal glitch effect
  setInterval(() => {
    if (Math.random() < 0.05) {
      // 5% chance of glitch
      const terminal = document.querySelector(".terminal");
      terminal.style.textShadow = "2px 2px 8px rgba(51, 255, 51, 0.7)";
      setTimeout(() => {
        terminal.style.textShadow = "none";
      }, 100);
    }
  }, 3000);

  // Add a cyber security trivia command
  const securityTrivia = [
    "The first computer virus was created in 1986 and was called 'Brain'.",
    "The most common password is still '123456' despite years of security warnings.",
    "The term 'bug' in computing originated from an actual moth that was found in Harvard's Mark II computer in 1947.",
    "USB devices can be programmed to act as keyboards, making them dangerous attack vectors.",
    "Two-factor authentication can prevent 99.9% of automated attacks.",
    "The average cost of a data breach in 2023 is over $4.2 million.",
    "Phishing attacks account for more than 80% of reported security incidents.",
    "The first documented ransomware attack happened in 1989 and was distributed via floppy disks.",
    "Over 30% of data breaches involve internal actors within organizations.",
    "HTTPS doesn't mean a website is safe—it only means the connection is encrypted.",
  ];

  // Optional: Add a typing animation effect to the displayed modules
  function addTypingEffectToText(element, text, speed = 20) {
    element.textContent = "";

    return new Promise((resolve) => {
      let i = 0;
      const typing = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(typing);
          resolve();
        }
      }, speed);
    });
  }

  // Add matrix rain effect
  function createMatrixRainEffect() {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "-1";
    canvas.style.opacity = "0.8";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    // Matrix characters
    const matrixCharacters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";

    // Convert to array
    const characters = matrixCharacters.split("");

    const fontSize = 14;
    const columns = canvas.width / fontSize;

    // Array of drops - one per column
    const drops = [];

    // x coordinate for each column
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    // Start the animation
    function drawMatrix() {
      // Set black, semi-transparent background
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text color
      ctx.fillStyle = "#0f0";
      ctx.font = fontSize + "px monospace";

      // Drop characters
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Set some drops back to top randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Increment y coordinate
        drops[i]++;
      }
    }

    // Run animation
    const matrixInterval = setInterval(drawMatrix, 40);

    // Return the interval so it can be cleared later
    return { matrixInterval, canvas };
  }

  // Optional: Add keystroke sounds
  function addKeyStrokeSounds() {
    // Create audio elements for keystroke sounds
    const keySounds = [
      "https://www.soundjay.com/mechanical/sounds/keyboard-1.mp3",
      "https://www.soundjay.com/mechanical/sounds/keyboard-2.mp3",
      "https://www.soundjay.com/mechanical/sounds/keyboard-3.mp3",
    ];

    const audioElements = keySounds.map((src) => {
      const audio = new Audio();
      audio.src = src;
      audio.volume = 0.2;
      return audio;
    });

    // Add keystroke sounds on input
    commandInput.addEventListener("keydown", function (e) {
      // Don't play sound for modifier keys
      if (e.key.length === 1 || e.key === "Enter" || e.key === "Backspace") {
        // Play a random sound
        const randomSound =
          audioElements[Math.floor(Math.random() * audioElements.length)];

        // Only play sound 30% of the time to not be annoying
        if (Math.random() < 0.3) {
          // Reset and play
          randomSound.currentTime = 0;
          randomSound.play().catch((e) => {
            // Ignore autoplay errors
          });
        }
      }
    });
  }

  // Uncomment to enable keystroke sounds
  // addKeyStrokeSounds();
});
