(function () {
  "use strict";

  const items = [
    "./images/img1.png",
    "./images/img2.png",
    "./images/img5.png",
    "./images/img6.png",
    "./images/img9.png",
    "./images/img12.png",
    // "./images/img3.png",
    // "./images/img13.png",
    // "./images/img4.png",
    // "./images/img7.png",
    // "./images/img8.png",
    // "./images/img10.png",
    // "./images/img11.png",
    // "./images/img14.png",
    // "./images/img15.png",
    // "./images/img16.png",
    // "./images/img17.png",
    // "./images/img18.png",
    // "./images/img19.png",
    // "./images/img20.png",
    // "./images/img21.png",
    // "./images/img22.png",
  ];

  let wins = 0;
  let isSpinning = false; // Track if spinning is in progress
  let isReset = true; // Track if reset has been triggered

  const loseSound = new Audio("./sounds/lose-sound.mp3");
  const doors = document.querySelectorAll(".door");
  const spinButton = document.querySelector("#spinner");
  const resetButton = document.querySelector("#reseter");

  spinButton.disabled = false; // Disable spin initially
  spinButton.addEventListener("click", spin);
  resetButton.addEventListener("click", () => {
    init();
    isReset = true; // Mark reset as triggered
    spinButton.disabled = false; // Enable spin after reset
    loseSound.pause();
    loseSound.currentTime = 0;
  });

  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ["star"],
    colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 69,
      scalar: 1.2,
      shapes: ["star"],
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ["circle"],
    });
  }

  async function spin() {
    if (isSpinning) return; // Prevent multiple spins if already spinning
    if (!isReset) return; // Prevent spin if reset hasn't been triggered

    console.log("Spin started");

    // Disable buttons and set the spinning flag
    isSpinning = true;
    spinButton.disabled = true;
    resetButton.disabled = true;

    try {
      init(false, 1, 5); // Initialize slot machine animation

      for (let i = 1; i < doors.length; i++) {
        const door = doors[i - 1];
        const boxes = door.querySelector(".boxes");

        // Apply the animation
        boxes.style.transform = "translateY(0)";
        boxes.style.transition = `transform ${i * 1}s ease-in-out`;
      }
      await checkWin(); // Call checkWin() only once after all doors finish
    } finally {
      // Always reset flags properly
      isSpinning = false;
      resetButton.disabled = false;
      isReset = false;
      // spinButton.disabled = false; // Re-enable spin button after spin
    }
  }

  function init(firstInit = true, groups = 1, duration = 1) {
    for (const door of doors) {
      if (firstInit) {
        door.dataset.spinned = "0";
      } else if (door.dataset.spinned === "1") {
        return;
      }

      const boxes = door.querySelector(".boxes");
      const boxesClone = boxes.cloneNode(false);

      let pool = [];
      if (!firstInit) {
        const uniqueShuffledItems = shuffle([...items]); // Shuffle a new array for each door
        for (let n = 0; n < (groups > 0 ? groups : 1); n++) {
          pool.push(...uniqueShuffledItems); // Use shuffled items
        }

        boxesClone.addEventListener(
          "transitionstart",
          function () {
            door.dataset.spinned = "1";
            this.querySelectorAll(".box img").forEach((img) => {
              img.style.filter = "blur(0px)";
            });
          },
          { once: true }
        );

        boxesClone.addEventListener(
          "transitionend",
          function () {
            this.querySelectorAll(".box img").forEach((img, index) => {
              img.style.filter = "blur(0)";
              if (index > 0) img.parentElement.remove();
            });

            // Add flare only after the transition ends
            const flare = document.createElement("div");
            flare.classList.add("flare");
            this.appendChild(flare);
          },
          { once: true }
        );
      } else {
        pool = [...items];
      }

      for (let i = pool.length - 1; i >= 0; i--) {
        const box = document.createElement("div");
        const flare = document.createElement("div");
        flare.classList.add("flare");
        box.classList.add("box");
        box.appendChild(flare);

        box.style.width = door.clientWidth + "px";
        box.style.height = door.clientHeight + "px";

        const img = document.createElement("img");
        img.src = pool[i];
        img.alt = `Image ${i}`;
        img.style.width = "69%";
        img.style.height = "92%";
        img.style.objectFit = "cover";

        box.appendChild(img);
        boxesClone.appendChild(box);
      }
      const speedMultiplier = 0.1;
      // 🔥 Increase speed by reducing duration (multiply by 0.5 for double speed)
      boxesClone.style.transitionDuration = `${
        duration > 0 ? duration * speedMultiplier : 0.3
      }s`;
      boxesClone.style.transform = `translateY(-${
        door.clientHeight * (pool.length - 1)
      }px)`;
      door.replaceChild(boxesClone, boxes);
    }
  }

  function shuffle([...arr]) {
    let m = arr.length;
    while (m) {
      const i = Math.floor(Math.random() * m--);
      [arr[m], arr[i]] = [arr[i], arr[m]];
    }
    return arr;
  }

  async function checkWin() {
    await new Promise((resolve) => setTimeout(resolve, 6000));
    const visibleImages = [];

    for (const door of doors) {
      const box = door.querySelector(".boxes .box:first-child img");
      visibleImages.push(box.src); // Collect the src of the first visible image
    }

    console.log(visibleImages);

    const allEqual = visibleImages.every((src) => src === visibleImages[0]);

    if (allEqual) {
      wins++;
      document.querySelector(".info").textContent = `Highest Score: ${wins}`;

      const winSound = new Audio(
        wins >= 2 ? "./sounds/win-sound-2.mp3" : "./sounds/win-sound-1.mp3"
      );

      await winSound.play();
      shoot();
    } else {
      wins = 0;
      document.querySelector(".info").textContent = `Highest Score: ${wins}`;

      if (!loseSound.paused) {
        loseSound.pause();
        loseSound.currentTime = 0;
      }
      loseSound.play();
    }
  }

  init();
})();
