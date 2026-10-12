import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from './members-config.js';
const $=id=>document.getElementById(id),status=$('account-status');let client;
try{
 const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
 client=createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
 const {data:{user},error}=await client.auth.getUser();
 if(error||!user){$('account-guest').hidden=false;status.textContent='Please sign in to continue.'}
 else{
  $('account-panel').hidden=false;status.textContent='Welcome back.';
  const data=user.user_metadata||{},address=data.shipping_address||{};
  $('profile-name').value=data.full_name||'';
  $('profile-email').value=user.email||'';
  $('profile-phone').value=data.phone||'';
  for(const [id,key] of [['profile-street','street'],['profile-city','city'],['profile-state','state'],['profile-postal','postal_code'],['profile-country','country']])$(id).value=address[key]||'';
  $('account-joined').textContent='Member since '+new Date(user.created_at).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
 }
}catch(e){$('account-guest').hidden=false;status.textContent='Unable to load your account. Please refresh and try again.'}
$('profile-form').addEventListener('submit',async e=>{
 e.preventDefault();if(!client)return;
 const button=$('save-profile');button.disabled=true;status.textContent='Saving your changes…';
 const v=id=>$(id).value.trim();
 try{
  const {error}=await client.auth.updateUser({data:{full_name:v('profile-name'),phone:v('profile-phone'),shipping_address:{street:v('profile-street'),city:v('profile-city'),state:v('profile-state'),postal_code:v('profile-postal'),country:v('profile-country')}}});
  status.textContent=error?'Could not save: '+error.message:'Your account details have been saved.';
 }catch(e){status.textContent='Could not save your changes. Please try again.'}
 finally{button.disabled=false}
});
$('account-logout').addEventListener('click',async()=>{if(client){await client.auth.signOut();location.href='signin.html'}});
