// Animation utilities for card game
export class CardAnimator {
  static async animateCardDeal(element: HTMLElement, delay: number = 0): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        element.classList.add('animate-deal')
        element.addEventListener('animationend', () => resolve(), { once: true })
      }, delay)
    })
  }

  static async animateCardPlay(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      element.classList.add('animate-play')
      element.addEventListener('animationend', () => resolve(), { once: true })
    })
  }

  static animateCardHover(element: HTMLElement): void {
    element.style.transform = 'translateY(-15px)'
  }

  static resetCardHover(element: HTMLElement): void {
    element.style.transform = 'translateY(0)'
  }

  static async animateTrickWin(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      element.classList.add('animate-trick-win')
      element.addEventListener('animationend', () => resolve(), { once: true })
    })
  }

  static async animateScoring(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      element.classList.add('animate-score')
      element.addEventListener('animationend', () => resolve(), { once: true })
    })
  }

  static async animateRoundTransition(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      element.classList.add('animate-round-transition')
      element.addEventListener('animationend', () => resolve(), { once: true })
    })
  }

  static pulseElement(element: HTMLElement): void {
    element.classList.add('pulse')
    setTimeout(() => element.classList.remove('pulse'), 600)
  }

  static shimmerElement(element: HTMLElement): void {
    element.classList.add('shimmer')
    setTimeout(() => element.classList.remove('shimmer'), 1200)
  }
}

export function createAnimationStyles(): string {
  return `
    @keyframes dealCard {
      from {
        opacity: 0;
        transform: translateY(-50px) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes playCard {
      0% {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: translateY(-80px) scale(0.9);
        opacity: 0;
      }
    }

    @keyframes trickWin {
      0% {
        transform: scale(1) rotate(0deg);
      }
      50% {
        transform: scale(1.1) rotate(5deg);
      }
      100% {
        transform: scale(1) rotate(0deg);
      }
    }

    @keyframes scoreFlip {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes roundTransition {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(230, 180, 90, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(230, 180, 90, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(230, 180, 90, 0);
      }
    }

    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }

    .animate-deal {
      animation: dealCard 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .animate-play {
      animation: playCard 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }

    .animate-trick-win {
      animation: trickWin 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .animate-score {
      animation: scoreFlip 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .animate-round-transition {
      animation: roundTransition 0.8s ease-in-out;
    }

    .pulse {
      animation: pulse 0.6s;
    }

    .shimmer {
      background: linear-gradient(
        to right,
        transparent 0%,
        rgba(255, 255, 255, 0.2) 50%,
        transparent 100%
      );
      background-size: 1000px 100%;
      animation: shimmer 1.2s;
    }

    .card {
      transition: transform 0.18s ease-out, box-shadow 0.18s ease-out, filter 0.15s ease-out;
    }

    .card.legal:hover {
      filter: drop-shadow(0 12px 20px rgba(7, 31, 29, 0.6));
    }

    .played-card {
      animation: dealCard 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .trick-score strong {
      transition: color 0.3s ease-out, transform 0.3s ease-out;
    }

    .trick-score strong.animate-score {
      animation: scoreFlip 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  `
}
