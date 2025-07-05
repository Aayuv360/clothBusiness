import { gsap } from "gsap";

export const animatePageEntry = (element: HTMLElement) => {
  gsap.fromTo(element, 
    { opacity: 0, y: 50 }, 
    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
  );
};

export const animateProductCards = (elements: NodeListOf<Element>) => {
  gsap.fromTo(elements, 
    { opacity: 0, scale: 0.9, y: 30 }, 
    { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      duration: 0.6, 
      stagger: 0.1, 
      ease: "power2.out" 
    }
  );
};

export const animateHero = () => {
  const tl = gsap.timeline();
  
  tl.fromTo('.hero-title', 
    { opacity: 0, y: 50 }, 
    { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
  )
  .fromTo('.hero-subtitle', 
    { opacity: 0, y: 30 }, 
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 
    '-=0.5'
  )
  .fromTo('.hero-buttons', 
    { opacity: 0, y: 20 }, 
    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 
    '-=0.3'
  );
  
  return tl;
};

export const animateModal = (element: HTMLElement, show: boolean) => {
  if (show) {
    gsap.set(element, { display: 'flex' });
    gsap.fromTo(element, 
      { opacity: 0, scale: 0.9 }, 
      { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
    );
  } else {
    gsap.to(element, {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => gsap.set(element, { display: 'none' })
    });
  }
};

export const animateSidebar = (element: HTMLElement, show: boolean) => {
  gsap.to(element, {
    x: show ? 0 : '100%',
    duration: 0.3,
    ease: 'power2.out'
  });
};

export const animateButton = (element: HTMLElement) => {
  gsap.to(element, {
    scale: 1.05,
    duration: 0.2,
    ease: 'power2.out',
    yoyo: true,
    repeat: 1
  });
};

export const animateCartUpdate = (element: HTMLElement) => {
  gsap.fromTo(element, 
    { scale: 1 }, 
    { 
      scale: 1.2, 
      duration: 0.2, 
      ease: 'power2.out',
      yoyo: true,
      repeat: 1
    }
  );
};

export const animateSearch = (element: HTMLElement) => {
  gsap.fromTo(element,
    { width: '0%', opacity: 0 },
    { width: '100%', opacity: 1, duration: 0.3, ease: 'power2.out' }
  );
};

export const createLoadingPulse = (element: HTMLElement) => {
  return gsap.to(element, {
    opacity: 0.5,
    duration: 1,
    ease: 'power2.inOut',
    yoyo: true,
    repeat: -1
  });
};
