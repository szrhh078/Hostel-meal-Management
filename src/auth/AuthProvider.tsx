import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
type AuthContextValue={user:User|null;session:Session|null;loading:boolean;signOut:()=>Promise<void>;refreshUser:()=>Promise<void>};
const AuthContext=createContext<AuthContextValue|undefined>(undefined);
export function AuthProvider({children}:{children:ReactNode}){
 const [session,setSession]=useState<Session|null>(null);const [loading,setLoading]=useState(true);
 useEffect(()=>{if(!supabase||!isSupabaseConfigured){setLoading(false);return;}let alive=true;
  supabase.auth.getSession().then(({data,error})=>{if(!alive)return;if(error)console.error(error);setSession(data.session);setLoading(false);});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);setLoading(false);});
  return()=>{alive=false;subscription.unsubscribe();};
 },[]);
 const signOut=async()=>{if(!supabase)return;const {error}=await supabase.auth.signOut();if(error)throw error;};
 const refreshUser=async()=>{if(!supabase)return;const {data,error}=await supabase.auth.getUser();if(error)throw error;if(session&&data.user)setSession({...session,user:data.user});};
 return <AuthContext.Provider value={{user:session?.user??null,session,loading,signOut,refreshUser}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be used inside AuthProvider');return value;}
