import Pricing from '@/components/ui/Pricing/Pricing'; // Import the Pricing component
import { createClient } from '@/utils/supabase/server';
import GenerateRecap from '@/components/GenerateRecap';

export default async function Account() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // If no user is found, fetch products for Pricing component
  if (!user) {
    const { data: products } = await fetchProducts(supabase);
    return <Pricing user={null} products={products ?? []} subscription={null} />;
  }

  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  // Fetch products for Pricing component if there's an error fetching the subscription or no active subscription is found
  if (subscriptionError || !subscription) {
    console.log(subscriptionError || 'No active subscription found.');
    const { data: products } = await fetchProducts(supabase);
    return <Pricing user={user} products={products ?? []} subscription={subscription} />;
  }

  // Render the account page content for users with an active subscription
  return (
    <section className="mb-32 bg-black">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Generate Images Using SD3
          </h1>
          <GenerateRecap />
        </div>
      </div>
    </section>
  );
}

// Helper function to fetch products for the Pricing component
async function fetchProducts(supabase: any) {
  return await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });
}