export const fadeUp = {
  hidden: { 
    opacity: 0, 
    y: 40 
  },
  visible: (custom = 0) => ({ 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: custom * 0.2
    }
  })
};

export const fadeDown = {
  hidden: { 
    opacity: 0, 
    y: -40 
  },
  visible: (custom = 0) => ({ 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: custom * 0.2
    }
  })
};

export const fadeLeft = {
  hidden: { 
    opacity: 0, 
    x: 60 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const fadeRight = {
  hidden: { 
    opacity: 0, 
    x: -60 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const fadeIn = {
  hidden: { 
    opacity: 0
  },
  visible: (custom = 0) => ({ 
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeIn",
      delay: custom * 0.2
    }
  })
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.04
    }
  }
};

export const childFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};
