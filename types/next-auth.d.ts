import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      createdAt: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    createdAt: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    createdAt: string;
  }
}
