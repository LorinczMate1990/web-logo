const basename = import.meta.env.VITE_PUBLIC_URL || '/';

export default {
  basename,
  images: import.meta.glob("./assets/turtles/*", { eager: true }) as Record<string, { default: string }>,
};
