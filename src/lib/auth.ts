import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabaseAdmin } from './supabase-admin';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Upsert user in database on sign-in
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .upsert(
            {
              email: user.email,
              full_name: user.name,
            },
            {
              onConflict: 'email',
            }
          )
          .select()
          .single();

        if (dbUser && user.email) {
          // Link any projects created before the user signed up
          await supabaseAdmin
            .from('projects')
            .update({ user_id: dbUser.id })
            .eq('client_email', user.email)
            .is('user_id', null);
        }
      }
      return true;
    },
    async session({ session }) {
      // Include user role in session
      if (session.user?.email) {
        const { data } = await supabaseAdmin
          .from('users')
          .select('role, id')
          .eq('email', session.user.email)
          .single();

        if (data) {
          session.user.id = data.id;
          session.user.role = data.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
