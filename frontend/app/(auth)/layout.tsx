import RedirectIfAuthenticated from "@/components/ui/auth/RedirectIfAuthenticated";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <RedirectIfAuthenticated />
      {children}
    </>
  );
}
