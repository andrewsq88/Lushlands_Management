@@ .. @@
 import React from 'react';
 import { Link, useNavigate } from 'react-router-dom';
 import { Home, LogOut, User, Settings } from 'lucide-react';
 import { useAuth } from '../hooks/useAuth';
+import { SubscriptionBadge } from './SubscriptionBadge';
 
 export function Header() {
 }
@@ .. @@
           <div className="flex items-center space-x-4">
+            <SubscriptionBadge />
             <div className="flex items-center space-x-2">
               <User className="w-5 h-5 text-gray-600" />
               <span className="text-gray-700">
                 {user.user_metadata?.first_name || user.email}
               </span>
             </div>