interface AnimatedFeatureProps {
  children: React.ReactNode;
  delay?: number;
}

export default function AnimatedFeature({ children }: AnimatedFeatureProps) {
  return <div>{children}</div>;
}
