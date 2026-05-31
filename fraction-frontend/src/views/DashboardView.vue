<template>
  <AdminView v-if="isAdminUser" />
  <main v-else class="min-h-screen bg-black/20">
    <div class="page-shell grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
      <aside class="glass-panel h-fit rounded-2xl p-4 lg:sticky lg:top-28">
        <div class="mb-6 flex items-center gap-3 px-2">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-200 text-lg font-black text-neutral-950">
            {{ userInitial }}
          </div>
          <div>
            <p class="font-black text-white">{{ user?.username || 'Collector' }}</p>
            <p class="text-sm capitalize text-neutral-500">{{ user?.role || 'Member' }}</p>
          </div>
        </div>

        <nav class="grid grid-cols-2 gap-2 lg:grid-cols-1">
          <button
            v-for="item in navItems"
            :key="item.key"
            class="rounded-2xl px-4 py-3 text-left text-sm font-bold transition"
            :class="activeSection === item.key ? 'bg-white text-neutral-950' : 'text-neutral-300 hover:bg-white/10 hover:text-white'"
            @click="activeSection = item.key"
          >
            {{ item.label }}
          </button>
        </nav>

        <button class="mt-6 w-full rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100 transition hover:bg-rose-500/20" @click="handleLogout">
          Logout
        </button>
      </aside>

      <section>
        <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">{{ activeLabel }}</p>
            <h1 class="mt-3 text-4xl font-black text-white md:text-5xl">
              {{ sectionTitle }}
            </h1>
            <p
              v-if="actionMessage"
              class="mt-3 text-sm font-semibold"
              :class="actionError ? 'text-rose-300' : 'text-emerald-300'"
            >
              {{ actionMessage }}
            </p>
          </div>
          <button v-if="activeSection === 'store'" class="premium-button w-fit" @click="showUploadModal = true">
            Upload Product
          </button>
        </div>

        <section v-if="activeSection === 'dashboard'" class="space-y-8">
          <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div v-for="stat in dashboardStats" :key="stat.label" class="glass-panel rounded-2xl p-5">
              <p class="text-sm text-neutral-500">{{ stat.label }}</p>
              <p class="mt-3 text-3xl font-black" :class="stat.color">{{ stat.value }}</p>
            </div>
          </div>

          <div class="glass-panel rounded-2xl p-6">
            <div class="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <p class="text-sm font-bold uppercase tracking-[0.28em] text-amber-200">Demo Wallet</p>
                <h2 class="mt-2 text-2xl font-black text-white">Add Fraction Credits</h2>
                <p class="mt-2 text-neutral-400">
                  Use this simulated top-up to demo purchases, bids, and auto bids without a payment gateway.
                </p>
              </div>
              <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="handleAddBalance">
                <input
                  v-model.number="balanceAmount"
                  type="number"
                  min="1"
                  class="field"
                  placeholder="Amount in FRC"
                />
                <button class="premium-button shrink-0" type="submit">Add Balance</button>
              </form>
            </div>
            <p
              v-if="balanceMessage"
              class="mt-4 text-sm font-semibold"
              :class="balanceError ? 'text-rose-300' : 'text-emerald-300'"
            >
              {{ balanceMessage }}
            </p>
          </div>

          <div class="glass-panel rounded-2xl p-6">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="text-2xl font-black text-white">Recent Products</h2>
              <button class="text-sm font-bold text-amber-200" @click="activeSection = 'collection'">Manage</button>
            </div>
            <ArtworkGrid
              :artworks="artworks.slice(0, 3)"
              empty-title="No products yet"
              empty-text="Upload your first collectible to start building your storefront."
              @edit="openEditModal"
              @delete="handleDelete"
              @auction="openAuctionModal"
            />
          </div>
        </section>

        <section v-else-if="activeSection === 'store'" class="space-y-6">
          <p class="text-neutral-400">Preview the collectible products currently attached to your public seller profile.</p>
          <ArtworkGrid
            :artworks="artworks"
            empty-title="Your store is empty"
            empty-text="Products you upload will appear here for collectors to browse."
            show-actions
            @edit="openEditModal"
            @delete="handleDelete"
            @auction="openAuctionModal"
          />
        </section>

        <section v-else-if="activeSection === 'collection'" class="space-y-6">
          <ArtworkGrid
            :artworks="artworks"
            empty-title="No products uploaded yet"
            empty-text="Your owned and listed products are shown here. Upload new seller stock from Store."
            show-actions
            @edit="openEditModal"
            @delete="handleDelete"
            @auction="openAuctionModal"
          />
        </section>

        <section v-else-if="activeSection === 'bids'" class="space-y-6">
          <ArtworkGrid
            :artworks="activeBidArtworks"
            empty-title="No active bids"
            empty-text="Start a bid from your collection when you are ready to auction a product."
            show-actions
            @edit="openEditModal"
            @delete="handleDelete"
            @auction="openAuctionModal"
          />
        </section>

        <section v-else-if="activeSection === 'profile'" class="glass-panel rounded-2xl p-6">
          <div class="grid gap-8 lg:grid-cols-[220px_1fr]">
            <div>
              <div class="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <img
                  v-if="profileForm.avatarUrl"
                  :src="profileForm.avatarUrl"
                  alt="Profile avatar"
                  class="h-full w-full object-cover"
                />
                <span v-else class="text-5xl font-black text-amber-200">{{ userInitial }}</span>
              </div>
              <p class="mt-4 text-sm text-neutral-400">
                Add an avatar URL, display name, seller bio, location, and store link.
              </p>
            </div>

            <form class="space-y-4" @submit.prevent="saveProfile">
              <div class="grid gap-4 md:grid-cols-2">
                <input v-model="profileForm.displayName" class="field" placeholder="Display name" />
                <input v-model="profileForm.location" class="field" placeholder="Location" />
              </div>
              <input v-model="profileForm.avatarUrl" class="field" placeholder="Avatar image URL" />
              <input v-model="profileForm.portfolioUrl" class="field" placeholder="Portfolio URL" />
              <textarea v-model="profileForm.bio" class="field min-h-32" placeholder="Short profile bio"></textarea>

              <p v-if="profileMessage" class="text-sm font-semibold text-emerald-300">{{ profileMessage }}</p>
              <button class="premium-button" type="submit">Save Profile</button>
            </form>
          </div>

          <div class="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p class="text-sm text-neutral-500">Seller Verification</p>
                <h3 class="mt-1 text-xl font-black text-white">
                  {{ user?.isVerifiedSeller ? 'Verified Seller' : verificationStatusLabel }}
                </h3>
                <p class="mt-2 text-neutral-400">
                  Verified sellers receive stronger marketplace placement and more buyer trust.
                </p>
              </div>
              <form class="flex w-full flex-col gap-3 md:max-w-md" @submit.prevent="submitVerification">
                <textarea v-model="verificationMessage" class="field min-h-24" placeholder="Describe your collectible experience, sourcing proof, or store history"></textarea>
                <button class="secondary-button" type="submit">Submit Verification Request</button>
              </form>
            </div>
          </div>

          <div class="mt-8 grid gap-5 md:grid-cols-2">
            <div>
              <p class="text-sm text-neutral-500">Username</p>
              <p class="mt-2 text-xl font-black text-white">{{ user?.username }}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-500">Role</p>
              <p class="mt-2 text-xl font-black capitalize text-white">{{ user?.role || 'Member' }}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-500">Wallet Balance</p>
              <p class="mt-2 text-xl font-black text-amber-200">{{ formatCredits(user?.walletBalance || 0) }}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-500">Uploaded Products</p>
              <p class="mt-2 text-xl font-black text-white">{{ artworks.length }}</p>
            </div>
          </div>
        </section>

        <section v-else-if="activeSection === 'commissions'" class="space-y-5">
          <div v-if="commissions.length" class="grid gap-4">
            <article v-for="commission in commissions" :key="commission._id" class="glass-panel rounded-2xl p-5">
              <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p class="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">{{ commission.status }}</p>
                  <h2 class="mt-2 text-2xl font-black text-white">{{ commission.title }}</h2>
                  <p class="mt-2 text-neutral-400">From {{ commission.fromUser }}</p>
                  <p class="mt-4 leading-7 text-neutral-300">{{ commission.message }}</p>
                  <div v-if="commission.replies?.length" class="mt-5 space-y-3">
                    <div v-for="reply in commission.replies" :key="reply._id || reply.createdAt" class="rounded-2xl border border-white/10 bg-black/25 p-4">
                      <p class="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">{{ reply.fromUser }}</p>
                      <p class="mt-2 text-neutral-300">{{ reply.message }}</p>
                      <p v-if="reply.offerAmount" class="mt-2 text-sm font-semibold text-emerald-200">Offer: {{ formatCredits(reply.offerAmount) }}</p>
                    </div>
                  </div>
                </div>
                <div class="min-w-44 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p class="text-sm text-neutral-500">Budget</p>
                  <p class="text-xl font-black text-white">{{ formatCredits(commission.budget) }}</p>
                  <p class="mt-3 text-sm text-neutral-500">Deadline</p>
                  <p class="text-sm font-semibold text-neutral-300">{{ formatDate(commission.deadline) }}</p>
                </div>
              </div>
              <div class="mt-5 flex flex-wrap gap-3">
                <button class="secondary-button px-4 py-2" @click="changeCommissionStatus(commission._id, 'accepted')">Accept</button>
                <button class="secondary-button px-4 py-2" @click="changeCommissionStatus(commission._id, 'in-progress')">In Progress</button>
                <button class="secondary-button px-4 py-2" @click="changeCommissionStatus(commission._id, 'completed')">Complete</button>
              </div>
              <form class="mt-5 grid gap-3 border-t border-white/10 pt-5 md:grid-cols-[1fr_160px_auto]" @submit.prevent="replyToConversation(commission)">
                <input v-model="conversationReplies[commission._id].message" class="field" placeholder="Reply or haggle message" required />
                <input v-model.number="conversationReplies[commission._id].offerAmount" class="field" type="number" min="0" placeholder="Offer FRC" />
                <button class="premium-button" type="submit">Send</button>
              </form>
            </article>
          </div>

          <div v-else class="glass-panel rounded-2xl p-10 text-center">
            <h2 class="text-3xl font-black text-white">No seller messages yet</h2>
            <p class="mx-auto mt-3 max-w-xl text-neutral-400">
              Buyer messages from product pages will appear here.
            </p>
          </div>
        </section>

        <section v-else-if="activeSection === 'orders'" class="space-y-5">
          <article v-for="order in sellerOrders" :key="order.key" class="glass-panel rounded-2xl p-5">
            <div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
              <div>
                <p class="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">{{ order.status }}</p>
                <h2 class="mt-2 text-2xl font-black text-white">{{ order.productTitle }}</h2>
                <p class="mt-2 text-neutral-400">Buyer: {{ order.buyer }}</p>
                <p class="mt-3 text-sm font-semibold text-amber-100">{{ formatCredits(order.price) }}</p>
                <p v-if="order.trackingCode" class="mt-2 text-sm text-neutral-400">Package code: {{ order.trackingCode }}</p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-300 lg:min-w-80">
                <p class="font-black text-white">{{ order.shipping.fullName }}</p>
                <p class="mt-2">{{ order.shipping.phone }}</p>
                <p class="mt-2">{{ order.shipping.addressLine1 }}</p>
                <p v-if="order.shipping.addressLine2">{{ order.shipping.addressLine2 }}</p>
                <p>{{ order.shipping.city }}, {{ order.shipping.state }} {{ order.shipping.postalCode }}</p>
                <p>{{ order.shipping.country }}</p>
              </div>
              <div class="lg:w-72">
                <input v-model="orderTrackingCodes[order.key]" class="field" placeholder="Package code" />
                <button class="secondary-button mt-3 w-full px-4 py-2" @click="handleOrderShipped(order)">
                  Item Shipped
                </button>
              </div>
            </div>
          </article>

          <div v-if="!sellerOrders.length" class="glass-panel rounded-2xl p-10 text-center">
            <h2 class="text-3xl font-black text-white">No orders yet</h2>
            <p class="mx-auto mt-3 max-w-xl text-neutral-400">
              Buyer shipping details will appear here after a product is purchased.
            </p>
          </div>
        </section>

        <section v-else-if="activeSection === 'wishlist'" class="space-y-6">
          <div v-if="wishlistNotifications.length" class="glass-panel rounded-2xl p-5">
            <h2 class="text-2xl font-black text-white">Wishlist Notifications</h2>
            <div class="mt-4 grid gap-3">
              <p v-for="notice in wishlistNotifications" :key="notice._id" class="rounded-2xl bg-amber-200/10 p-4 text-sm font-semibold text-amber-100">
                {{ notice.title }} has {{ notice.discountPercent ? `${notice.discountPercent}% discount` : 'bid activity' }}.
              </p>
            </div>
          </div>

          <ArtworkGrid
            :artworks="wishlistArtworks"
            empty-title="Your wishlist is empty"
            empty-text="Add products from the detail page to watch sales, discounts, and bid activity."
          />
        </section>

        <section v-else-if="activeSection === 'inventory'" class="space-y-6">
          <div class="glass-panel rounded-2xl p-5">
            <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p class="text-sm text-neutral-500">Stored Items</p>
                <h2 class="mt-1 text-3xl font-black text-white">{{ storedInventoryItems.length }} ready to ship</h2>
              </div>
              <button
                class="premium-button"
                :disabled="!selectedInventoryItemIds.length"
                @click="showInventoryShipModal = true"
              >
                Ship Selected
              </button>
              <button
                class="secondary-button"
                :disabled="!selectedSellableInventoryItems.length"
                @click="handleSellInventory"
              >
                Sell Gacha Items
              </button>
            </div>
            <div class="mt-5 flex flex-wrap gap-2">
              <button
                v-for="filter in inventorySellFilters"
                :key="filter"
                class="secondary-button px-4 py-2"
                @click="selectInventoryForSale(filter)"
              >
                Select {{ filter }}
              </button>
            </div>
          </div>

          <div v-if="sortedInventoryItems.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="item in sortedInventoryItems"
              :key="item._id"
              class="glass-panel rounded-2xl p-5"
              :class="selectedInventoryItemIds.includes(item._id) ? 'border-amber-200/40' : ''"
            >
              <div class="flex items-start gap-4">
                <input
                  v-if="item.status === 'stored'"
                  type="checkbox"
                  class="mt-1 h-5 w-5 accent-amber-200"
                  :checked="selectedInventoryItemIds.includes(item._id)"
                  @change="toggleInventorySelection(item._id)"
                />
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.name"
                  class="h-20 w-20 rounded-2xl object-cover"
                />
                <div class="min-w-0">
                  <p class="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">{{ item.rarity }}</p>
                  <h3 class="mt-2 text-xl font-black text-white">{{ item.name }}</h3>
                  <p class="mt-2 text-sm text-neutral-400">{{ item.description || item.source }}</p>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <span v-if="item.source === 'gacha'" class="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-100">
                      Sellable
                    </span>
                    <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-neutral-300">
                      {{ item.source }}
                    </span>
                    <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-neutral-300">
                      {{ item.status }}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="glass-panel rounded-2xl p-10 text-center">
            <h2 class="text-3xl font-black text-white">Inventory is empty</h2>
            <p class="mx-auto mt-3 max-w-xl text-neutral-400">
              Gacha prizes and purchased products will appear here.
            </p>
          </div>
        </section>

        <section v-else-if="activeSection === 'shipping'" class="space-y-5">
          <article v-for="shipment in user?.shipments || []" :key="shipment._id" class="glass-panel rounded-2xl p-5">
            <div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
              <div>
                <p class="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">{{ shipment.status }}</p>
                <h2 class="mt-2 text-2xl font-black text-white">{{ shipment.itemName }}</h2>
                <p class="mt-2 text-neutral-400">{{ shipment.source }} item requested for shipment.</p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-300 lg:min-w-80">
                <p class="font-black text-white">{{ shipment.shippingDetails?.fullName }}</p>
                <p class="mt-2">{{ shipment.shippingDetails?.phone }}</p>
                <p class="mt-2">{{ shipment.shippingDetails?.addressLine1 }}</p>
                <p v-if="shipment.shippingDetails?.addressLine2">{{ shipment.shippingDetails.addressLine2 }}</p>
                <p>{{ shipment.shippingDetails?.city }}, {{ shipment.shippingDetails?.state }} {{ shipment.shippingDetails?.postalCode }}</p>
                <p>{{ shipment.shippingDetails?.country }}</p>
              </div>
            </div>
          </article>

          <div v-if="!user?.shipments?.length" class="glass-panel rounded-2xl p-10 text-center">
            <h2 class="text-3xl font-black text-white">No shipments yet</h2>
            <p class="mx-auto mt-3 max-w-xl text-neutral-400">
              Items shipped from inventory will appear here with fulfilment details.
            </p>
          </div>
        </section>

        <section v-else-if="activeSection === 'purchases'" class="space-y-5">
          <article v-for="purchase in user?.purchases || []" :key="purchase._id || purchase.createdAt" class="glass-panel rounded-2xl p-5">
            <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p class="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">{{ purchase.shippingStatus }}</p>
                <h2 class="mt-2 text-2xl font-black text-white">{{ purchase.title || purchase.product?.title }}</h2>
                <p class="mt-2 text-neutral-400">Seller: {{ purchase.seller }}</p>
                <p v-if="purchase.trackingCode" class="mt-2 text-sm text-neutral-400">Package code: {{ purchase.trackingCode }}</p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p class="text-sm text-neutral-500">Paid</p>
                <p class="text-xl font-black text-white">{{ formatCredits(purchase.price) }}</p>
              </div>
            </div>
          </article>

          <div v-if="!user?.purchases?.length" class="glass-panel rounded-2xl p-10 text-center">
            <h2 class="text-3xl font-black text-white">No purchases yet</h2>
            <p class="mx-auto mt-3 max-w-xl text-neutral-400">
              Products you buy will appear here with their shipping status.
            </p>
          </div>
        </section>

        <section v-else-if="activeSection === 'giveaways'" class="space-y-5">
          <div class="glass-panel rounded-2xl p-5">
            <p class="text-sm text-neutral-500">Available Tickets</p>
            <p class="mt-2 text-4xl font-black text-amber-200">{{ user?.tickets || 0 }}</p>
            <p class="mt-2 text-neutral-400">Earn tickets by buying or selling collectible products.</p>
          </div>

          <article v-for="giveaway in giveaways" :key="giveaway._id" class="glass-panel rounded-2xl p-5">
            <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p class="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">{{ giveaway.status }}</p>
                <h2 class="mt-2 text-2xl font-black text-white">{{ giveaway.title }}</h2>
                <p class="mt-2 text-neutral-400">{{ giveaway.description }}</p>
                <p class="mt-3 text-sm text-neutral-500">Prize: {{ giveaway.prize }}</p>
              </div>
              <button class="premium-button" @click="joinEvent(giveaway._id)">
                Join for 1 ticket
              </button>
            </div>
          </article>

          <div v-if="!giveaways.length" class="glass-panel rounded-2xl p-10 text-center text-neutral-400">
            No giveaways are active yet.
          </div>
        </section>

        <section v-else-if="activeSection === 'settings'" class="glass-panel rounded-2xl p-6">
          <form class="space-y-6" @submit.prevent="saveSettings">
            <div class="grid gap-5 md:grid-cols-2">
              <label class="block">
                <span class="mb-2 block text-sm font-semibold text-neutral-300">Theme</span>
                <select v-model="settings.theme" class="field" @change="applyTheme(settings.theme)">
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                </select>
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-semibold text-neutral-300">Language</span>
                <select v-model="settings.language" class="field">
                  <option v-for="language in languages" :key="language.code" :value="language.code">
                    {{ language.label }}
                  </option>
                </select>
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-semibold text-neutral-300">Region</span>
                <select v-model="settings.region" class="field">
                  <option v-for="region in regions" :key="region" :value="region">
                    {{ region }}
                  </option>
                </select>
              </label>

            </div>

            <p class="text-sm text-neutral-400">
              Fraction uses platform credits for all purchases, bids, seller messages, and demo wallet balances.
            </p>

            <p v-if="settingsMessage" class="text-sm font-semibold text-emerald-300">{{ settingsMessage }}</p>
            <button class="premium-button" type="submit">Save Settings</button>
          </form>
        </section>

        <section v-else class="glass-panel rounded-2xl p-12 text-center">
          <h2 class="text-3xl font-black text-white">{{ sectionTitle }}</h2>
          <p class="mx-auto mt-3 max-w-xl text-neutral-400">
            This section is available for the next feature expansion.
          </p>
        </section>
      </section>
    </div>

    <div v-if="editingArtwork" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5">
      <div class="glass-panel w-full max-w-2xl rounded-2xl p-6">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-3xl font-black text-white">Edit Product</h2>
          <button class="secondary-button px-4 py-2" @click="editingArtwork = null">Close</button>
        </div>

        <form class="space-y-4" @submit.prevent="handleUpdate">
          <input v-model="editingArtwork.title" placeholder="Title" class="field" required />
          <textarea v-model="editingArtwork.description" placeholder="Description" class="field min-h-28" />
          <input v-model.number="editingArtwork.price" type="number" min="0" placeholder="Price" class="field" required />
          <input v-model.number="editingArtwork.stockCount" type="number" min="0" placeholder="Stock count" class="field" required />
          <select v-model="editingArtwork.category" class="field">
            <option v-for="category in categories" :key="category">{{ category }}</option>
          </select>
          <select v-model="editingArtwork.subCategory" class="field">
            <option value="">Sub category</option>
            <option v-for="subCategory in subCategories[editingArtwork.category] || []" :key="subCategory">{{ subCategory }}</option>
          </select>
          <input v-model="editingArtwork.setName" placeholder="Set name" class="field" />
          <input v-model="editingArtwork.era" placeholder="Era" class="field" />
          <select v-model="editingArtwork.condition" class="field">
            <option v-for="condition in conditions" :key="condition">{{ condition }}</option>
          </select>
          <textarea v-model="editingArtwork.authenticityNotes" placeholder="Authenticity, grading, or provenance notes" class="field min-h-24" />
          <select v-model="editingArtwork.saleType" class="field">
            <option value="sale">Sale</option>
            <option value="bid">Bid</option>
            <option value="both">Sale + Bid</option>
          </select>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button class="premium-button" type="submit">Save Changes</button>
            <button class="secondary-button" type="button" @click="editingArtwork = null">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5">
      <div class="glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-3xl font-black text-white">Upload Product</h2>
          <button class="secondary-button px-4 py-2" @click="showUploadModal = false">Close</button>
        </div>

        <form class="space-y-4" @submit.prevent="handleUploadArtwork">
          <input v-model="uploadForm.title" placeholder="Product title" class="field" required />
          <textarea v-model="uploadForm.description" placeholder="Description" class="field min-h-28" />
          <input v-model.number="uploadForm.price" type="number" min="0" placeholder="Price" class="field" required />
          <input v-model.number="uploadForm.stockCount" type="number" min="1" placeholder="Stock count" class="field" required />

          <div class="grid gap-4 sm:grid-cols-2">
            <select v-model="uploadForm.category" class="field">
              <option v-for="category in categories" :key="category">{{ category }}</option>
            </select>

            <select v-model="uploadForm.subCategory" class="field">
              <option value="">Sub category</option>
              <option v-for="subCategory in uploadSubCategories" :key="subCategory">{{ subCategory }}</option>
            </select>

            <input v-model="uploadForm.setName" class="field" placeholder="Set name" />

            <input v-model="uploadForm.era" class="field" placeholder="Era" />

            <select v-model="uploadForm.condition" class="field">
              <option v-for="condition in conditions" :key="condition">{{ condition }}</option>
            </select>

            <select v-model="uploadForm.saleType" class="field">
              <option value="sale">Sale</option>
              <option value="bid">Bid</option>
              <option value="both">Sale + Bid</option>
            </select>
          </div>

          <label class="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-semibold text-neutral-300">
            <input v-model="uploadForm.sealed" type="checkbox" class="accent-amber-200" />
            Sealed item
          </label>

          <textarea v-model="uploadForm.authenticityNotes" class="field min-h-24" placeholder="Authenticity, grading, provenance, or receipt notes"></textarea>

          <input type="file" accept="image/*" class="field file:mr-4 file:rounded-full file:border-0 file:bg-amber-200 file:px-4 file:py-2 file:text-sm file:font-bold file:text-neutral-950" required @change="handleFileChange" />

          <p v-if="uploadMessage" class="text-sm font-semibold" :class="uploadError ? 'text-rose-300' : 'text-emerald-300'">
            {{ uploadMessage }}
          </p>

          <div class="flex flex-col gap-3 sm:flex-row">
            <button class="premium-button" type="submit" :disabled="isUploading">
              {{ isUploading ? 'Uploading...' : 'Upload' }}
            </button>
            <button class="secondary-button" type="button" @click="showUploadModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="auctionArtwork" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5">
      <div class="glass-panel w-full max-w-xl rounded-2xl p-6">
        <div class="mb-6 flex items-center justify-between gap-4">
          <h2 class="text-3xl font-black text-white">Start Timed Bid</h2>
          <button class="secondary-button px-4 py-2" @click="auctionArtwork = null">Close</button>
        </div>

        <form class="space-y-4" @submit.prevent="startAuction">
          <p class="text-neutral-400">
            One stock from {{ auctionArtwork.title }} will move into a separate bid listing. Remaining stock stays on sale.
          </p>
          <input v-model="auctionEndTime" class="field" type="datetime-local" required />
          <button class="premium-button" type="submit">Create Bid Listing</button>
        </form>
      </div>
    </div>

    <div v-if="showInventoryShipModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5">
      <div class="glass-panel w-full max-w-2xl rounded-2xl p-6">
        <div class="mb-6 flex items-center justify-between gap-4">
          <h2 class="text-3xl font-black text-white">Ship Inventory</h2>
          <button class="secondary-button px-4 py-2" @click="showInventoryShipModal = false">Close</button>
        </div>

        <form class="space-y-4" @submit.prevent="handleShipInventory">
          <p class="text-sm font-semibold text-amber-100">
            {{ selectedInventoryItemIds.length }} item{{ selectedInventoryItemIds.length > 1 ? 's' : '' }} selected for demo shipping.
          </p>
          <div class="grid gap-4 sm:grid-cols-2">
            <input v-model="inventoryShippingForm.fullName" class="field" placeholder="Full name" required />
            <input v-model="inventoryShippingForm.phone" class="field" placeholder="Phone number" required />
          </div>
          <input v-model="inventoryShippingForm.addressLine1" class="field" placeholder="Address line 1" required />
          <input v-model="inventoryShippingForm.addressLine2" class="field" placeholder="Address line 2" />
          <div class="grid gap-4 sm:grid-cols-3">
            <input v-model="inventoryShippingForm.city" class="field" placeholder="City" required />
            <input v-model="inventoryShippingForm.state" class="field" placeholder="State / region" required />
            <input v-model="inventoryShippingForm.postalCode" class="field" placeholder="Postal code" required />
          </div>
          <input v-model="inventoryShippingForm.country" class="field" placeholder="Country" required />

          <p v-if="inventoryShipMessage" class="text-sm font-semibold" :class="inventoryShipError ? 'text-rose-300' : 'text-emerald-300'">
            {{ inventoryShipMessage }}
          </p>

          <button class="premium-button" type="submit">Confirm Shipping</button>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminView from './AdminView.vue'
import { deleteProduct, getOwnerProducts, listProductForSale, markOrderShipped, updateProduct, uploadProduct } from '../services/productService'
import { getArtistCommissions, replyCommission, updateCommissionStatus } from '../services/commissionService'
import { getGiveaways, joinGiveaway } from '../services/giveawayService'
import {
  addWalletBalance,
  getUserProfile,
  requestSellerVerification,
  sellInventoryItems,
  shipInventoryItems,
  updateUserProfile,
  updateUserSettings,
} from '../services/userService'
import ProductCard from '../components/ProductCard.vue'
import { getProductImageUrl } from '../utils/productImage'
import {
  applyTheme,
  categories,
  conditions,
  formatCredits,
  getStoredSettings,
  languages,
  regions,
  subCategories,
} from '../utils/preferences'

const ArtworkGrid = defineComponent({
  props: {
    artworks: { type: Array, required: true },
    emptyTitle: { type: String, required: true },
    emptyText: { type: String, required: true },
    showActions: { type: Boolean, default: false },
  },
  emits: ['edit', 'delete', 'auction'],
  setup(props, { emit }) {
    return () => {
      if (!props.artworks.length) {
        return h('div', { class: 'glass-panel rounded-2xl p-10 text-center' }, [
          h('h3', { class: 'text-2xl font-black text-white' }, props.emptyTitle),
          h('p', { class: 'mt-3 text-neutral-400' }, props.emptyText),
        ])
      }

      return h('div', { class: 'grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3' },
        props.artworks.map((artwork) =>
          h('div', { class: 'relative', key: artwork._id }, [
            h(ProductCard, {
              id: artwork._id,
              image: getProductImageUrl(artwork.imageUrl),
              title: artwork.title,
              artist: artwork.artist,
              price: artwork.saleType === 'bid' ? artwork.currentBid || 1 : artwork.price,
              saleType: artwork.saleType,
            }),
            h('div', {
              class: 'pointer-events-none absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-black/70 px-3 py-2 text-xs font-bold text-white backdrop-blur',
            }, `Stock: ${artwork.stockCount ?? 1}`),
            props.showActions
              ? h('div', { class: 'absolute right-3 top-3 z-10 flex flex-wrap gap-2' }, [
                  h('button', {
                    class: 'rounded-full bg-black/70 px-3 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-rose-600',
                    onClick: (event) => {
                      event.stopPropagation()
                      emit('delete', artwork._id)
                    },
                  }, 'Delete'),
                  h('button', {
                    class: 'rounded-full bg-black/70 px-3 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white hover:text-neutral-950',
                    onClick: (event) => {
                      event.stopPropagation()
                      emit('edit', artwork)
                    },
                  }, 'Edit'),
                  h('button', {
                    class: 'rounded-full bg-amber-200 px-3 py-2 text-xs font-bold text-neutral-950 transition hover:bg-amber-100',
                    onClick: (event) => {
                      event.stopPropagation()
                      emit('auction', artwork)
                    },
                  }, 'Start Bid'),
                ])
              : null,
          ])
        )
      )
    }
  },
})

const router = useRouter()
const user = ref(null)
const activeSection = ref('dashboard')
const artworks = ref([])
const editingArtwork = ref(null)
const showUploadModal = ref(false)
const auctionArtwork = ref(null)
const auctionEndTime = ref('')
const selectedFile = ref(null)
const uploadMessage = ref('')
const uploadError = ref(false)
const isUploading = ref(false)
const commissions = ref([])
const giveaways = ref([])
const settings = ref(getStoredSettings())
const settingsMessage = ref('')
const profileMessage = ref('')
const actionMessage = ref('')
const actionError = ref(false)
const balanceAmount = ref(1000)
const balanceMessage = ref('')
const balanceError = ref(false)
const verificationMessage = ref('')
const conversationReplies = ref({})
const orderTrackingCodes = ref({})
const showInventoryShipModal = ref(false)
const selectedInventoryItemIds = ref([])
const inventoryShipMessage = ref('')
const inventoryShipError = ref(false)
const inventoryShippingForm = ref({
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Malaysia',
})
const profileForm = ref({
  displayName: '',
  bio: '',
  avatarUrl: '',
  location: '',
  portfolioUrl: '',
})

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'store', label: 'Store' },
  { key: 'collection', label: 'Collection' },
  { key: 'bids', label: 'My Bids' },
  { key: 'commissions', label: 'Messages' },
  { key: 'orders', label: 'Orders' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'giveaways', label: 'Giveaways' },
  { key: 'profile', label: 'Profile' },
  { key: 'settings', label: 'Settings' },
]

const uploadForm = ref({
  title: '',
  description: '',
  price: '',
  category: categories[0],
  subCategory: subCategories[categories[0]]?.[0] || '',
  setName: '',
  era: '',
  condition: conditions[0],
  sealed: false,
  authenticityNotes: '',
  saleType: 'sale',
  stockCount: 1,
})
const inventorySellFilters = ['All Gacha', 'Common', 'Rare', 'Epic', 'Legendary']
const uploadSubCategories = computed(() => subCategories[uploadForm.value.category] || [])

const activeBidArtworks = computed(() => artworks.value.filter((artwork) => artwork.saleType === 'bid' || artwork.saleType === 'both'))

const wishlistArtworks = computed(() => user.value?.wishlist || [])
const inventoryItems = computed(() => user.value?.inventory || [])
const sortedInventoryItems = computed(() => {
  const rarityOrder = {
    Legendary: 1,
    Epic: 2,
    Rare: 3,
    Common: 4,
    Purchased: 5,
  }

  return [...inventoryItems.value].sort((a, b) => {
    const statusSort = a.status === b.status ? 0 : a.status === 'stored' ? -1 : 1
    if (statusSort) return statusSort

    const raritySort = (rarityOrder[a.rarity] || 99) - (rarityOrder[b.rarity] || 99)
    if (raritySort) return raritySort

    return new Date(b.acquiredAt || 0) - new Date(a.acquiredAt || 0)
  })
})
const storedInventoryItems = computed(() => inventoryItems.value.filter((item) => item.status === 'stored'))
const selectedSellableInventoryItems = computed(() => {
  return inventoryItems.value.filter(
    (item) => selectedInventoryItemIds.value.includes(item._id) && item.source === 'gacha' && item.status === 'stored'
  )
})

const wishlistNotifications = computed(() => {
  return wishlistArtworks.value.filter(
    (artwork) => artwork.discountPercent > 0 || artwork.saleType === 'bid' || artwork.saleType === 'both'
  )
})

const sellerOrders = computed(() => {
  return artworks.value.flatMap((artwork) =>
    (artwork.purchaseHistory || []).map((purchase) => ({
      key: `${artwork._id}-${purchase._id || purchase.createdAt}`,
      productId: artwork._id,
      purchaseId: purchase._id,
      productTitle: artwork.title,
      buyer: purchase.buyer,
      price: purchase.price,
      status: purchase.status || 'pending-shipment',
      trackingCode: purchase.trackingCode || '',
      shipping: purchase.shippingDetails || {},
    }))
  )
})

const userInitial = computed(() => user.value?.username?.charAt(0)?.toUpperCase() || 'U')

const isAdminUser = computed(() => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
    return storedUser?.role === 'admin'
  } catch {
    return false
  }
})

const activeLabel = computed(() => navItems.find((item) => item.key === activeSection.value)?.label || 'Dashboard')

const sectionTitle = computed(() => {
  const titles = {
    dashboard: `Welcome back, ${user.value?.username || 'Collector'}`,
    store: 'Your Storefront',
    collection: 'My Uploaded Products',
    bids: 'Active Bids',
    commissions: 'Seller Messages',
    orders: 'Orders',
    wishlist: 'Wishlist',
    inventory: 'Inventory',
    shipping: 'Shipping',
    purchases: 'Purchases',
    giveaways: 'Giveaways',
    profile: 'Profile',
    settings: 'Settings',
  }

  return titles[activeSection.value]
})

const verificationStatusLabel = computed(() => {
  const status = user.value?.verificationStatus || 'not-requested'
  if (status === 'pending') return 'Pending Review'
  if (status === 'rejected') return 'Rejected'
  return 'Not Verified'
})

const dashboardStats = computed(() => [
  { label: 'Wallet Balance', value: formatCredits(user.value?.walletBalance || 0), color: 'text-amber-200' },
  { label: 'Net Worth', value: formatCredits(user.value?.netWorth || 0), color: 'text-emerald-200' },
  { label: 'Active Bids', value: activeBidArtworks.value.length, color: 'text-rose-200' },
  { label: 'Uploaded Products', value: artworks.value.length, color: 'text-white' },
])

const refreshUser = async () => {
  if (!user.value?.username) return
  user.value = await getUserProfile(user.value.username)
  localStorage.setItem('user', JSON.stringify(user.value))
  settings.value = getStoredSettings()
  profileForm.value = {
    displayName: user.value.profile?.displayName || '',
    bio: user.value.profile?.bio || '',
    avatarUrl: user.value.profile?.avatarUrl || '',
    location: user.value.profile?.location || '',
    portfolioUrl: user.value.profile?.portfolioUrl || '',
  }
}

const refreshArtworks = async () => {
  if (!user.value?.username) return
  artworks.value = await getOwnerProducts(user.value.username)
}

const refreshCommissions = async () => {
  if (!user.value?.username) return
  commissions.value = await getArtistCommissions(user.value.username)
  commissions.value.forEach((commission) => {
    if (!conversationReplies.value[commission._id]) {
      conversationReplies.value[commission._id] = {
        message: '',
        offerAmount: '',
      }
    }
  })
}

const refreshGiveaways = async () => {
  giveaways.value = await getGiveaways()
}

const joinEvent = async (id) => {
  try {
    const result = await joinGiveaway(id, user.value.username)
    user.value = result.user
    localStorage.setItem('user', JSON.stringify(user.value))
    await refreshGiveaways()
    setActionMessage('Giveaway joined.')
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not join giveaway.', true)
  }
}

const handleDelete = async (id) => {
  try {
    await deleteProduct(id)
    artworks.value = artworks.value.filter((artwork) => artwork._id !== id)
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not delete product.', true)
  }
}

const setActionMessage = (message, isError = false) => {
  actionMessage.value = message
  actionError.value = isError
  setTimeout(() => {
    actionMessage.value = ''
  }, 3500)
}

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

const resetUploadForm = () => {
  uploadForm.value = {
    title: '',
    description: '',
    price: '',
    category: categories[0],
    subCategory: subCategories[categories[0]]?.[0] || '',
    setName: '',
    era: '',
    condition: conditions[0],
    sealed: false,
    authenticityNotes: '',
    saleType: 'sale',
    stockCount: 1,
  }
  selectedFile.value = null
}

const handleUploadArtwork = async () => {
  uploadMessage.value = ''
  uploadError.value = false

  if (!selectedFile.value) {
    uploadMessage.value = 'Please choose an image file.'
    uploadError.value = true
    return
  }

  isUploading.value = true

  try {
    const formData = new FormData()
    formData.append('image', selectedFile.value)
    formData.append('title', uploadForm.value.title)
    formData.append('artist', user.value.username)
    formData.append('description', uploadForm.value.description)
    formData.append('price', uploadForm.value.price)
    formData.append('category', uploadForm.value.category)
    formData.append('subCategory', uploadForm.value.subCategory)
    formData.append('setName', uploadForm.value.setName)
    formData.append('era', uploadForm.value.era)
    formData.append('condition', uploadForm.value.condition)
    formData.append('sealed', uploadForm.value.sealed)
    formData.append('authenticityNotes', uploadForm.value.authenticityNotes)
    formData.append('saleType', uploadForm.value.saleType)
    formData.append('stockCount', uploadForm.value.stockCount)

    await uploadProduct(formData)
    await refreshArtworks()
    resetUploadForm()
    showUploadModal.value = false
  } catch (error) {
    uploadMessage.value = error.response?.data?.error || 'Upload failed.'
    uploadError.value = true
  } finally {
    isUploading.value = false
  }
}

const submitVerification = async () => {
  try {
    user.value = await requestSellerVerification(user.value.username, verificationMessage.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    verificationMessage.value = ''
    setActionMessage('Verification request submitted.')
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not submit verification request.', true)
  }
}

const handleAddBalance = async () => {
  balanceMessage.value = ''
  balanceError.value = false

  try {
    user.value = await addWalletBalance(user.value.username, balanceAmount.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    balanceMessage.value = `${formatCredits(balanceAmount.value)} added to your wallet.`
  } catch (error) {
    balanceMessage.value = error.response?.data?.error || 'Could not add balance.'
    balanceError.value = true
  }
}

const toggleInventorySelection = (id) => {
  if (selectedInventoryItemIds.value.includes(id)) {
    selectedInventoryItemIds.value = selectedInventoryItemIds.value.filter((itemId) => itemId !== id)
    return
  }

  selectedInventoryItemIds.value = [...selectedInventoryItemIds.value, id]
}

const handleShipInventory = async () => {
  inventoryShipMessage.value = ''
  inventoryShipError.value = false

  try {
    user.value = await shipInventoryItems(
      user.value.username,
      selectedInventoryItemIds.value,
      inventoryShippingForm.value
    )
    localStorage.setItem('user', JSON.stringify(user.value))
    selectedInventoryItemIds.value = []
    showInventoryShipModal.value = false
    inventoryShipMessage.value = 'Selected inventory items are marked for shipping.'
    setActionMessage('Selected inventory items are marked for shipping.')
  } catch (error) {
    inventoryShipMessage.value = error.response?.data?.error || 'Could not ship inventory items.'
    inventoryShipError.value = true
  }
}

const handleSellInventory = async () => {
  const sellableIds = selectedSellableInventoryItems.value.map((item) => item._id)

  if (!sellableIds.length) {
    setActionMessage('Select at least one gacha item to sell.', true)
    return
  }

  try {
    const result = await sellInventoryItems(user.value.username, sellableIds)
    user.value = result.user
    localStorage.setItem('user', JSON.stringify(user.value))
    selectedInventoryItemIds.value = selectedInventoryItemIds.value.filter(
      (id) => !sellableIds.includes(id)
    )
    setActionMessage(`${formatCredits(result.earnedCredits)} added and ${result.ticketsEarned} ticket earned.`)
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not sell inventory items.', true)
  }
}

const selectInventoryForSale = (filter) => {
  selectedInventoryItemIds.value = inventoryItems.value
    .filter((item) => item.source === 'gacha' && item.status === 'stored')
    .filter((item) => filter === 'All Gacha' || item.rarity === filter)
    .map((item) => item._id)
}

const openAuctionModal = (artwork) => {
  auctionArtwork.value = artwork
  const defaultEnd = new Date(Date.now() + 24 * 60 * 60 * 1000)
  auctionEndTime.value = defaultEnd.toISOString().slice(0, 16)
}

const startAuction = async () => {
  try {
    const updatedArtwork = {
      username: user.value.username,
      saleType: 'bid',
      bidEndTime: auctionEndTime.value,
    }

    await listProductForSale(auctionArtwork.value._id, updatedArtwork)
    await refreshArtworks()
    auctionArtwork.value = null
    setActionMessage('Product listed for bidding.')
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not list product for bidding.', true)
  }
}

const replyToConversation = async (commission) => {
  const reply = conversationReplies.value[commission._id]

  try {
    await replyCommission(commission._id, {
      fromUser: user.value.username,
      message: reply.message,
      offerAmount: reply.offerAmount,
    })
    conversationReplies.value[commission._id] = { message: '', offerAmount: '' }
    await refreshCommissions()
    setActionMessage('Message sent.')
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not send message.', true)
  }
}

const handleOrderShipped = async (order) => {
  try {
    const updated = await markOrderShipped(
      order.productId,
      order.purchaseId,
      user.value.username,
      orderTrackingCodes.value[order.key]
    )
    artworks.value = artworks.value.map((artwork) => artwork._id === updated._id ? updated : artwork)
    setActionMessage('Order marked as shipped.')
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not update order shipment.', true)
  }
}

const changeCommissionStatus = async (id, status) => {
  try {
    await updateCommissionStatus(id, status)
    await refreshCommissions()
    setActionMessage('Message status updated.')
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not update message status.', true)
  }
}

const saveSettings = async () => {
  try {
    applyTheme(settings.value.theme)
    localStorage.setItem('fraction-settings', JSON.stringify(settings.value))

    if (user.value?.username) {
      user.value = await updateUserSettings(user.value.username, settings.value)
      localStorage.setItem('user', JSON.stringify(user.value))
    }

    settingsMessage.value = 'Settings saved.'
    setTimeout(() => {
      settingsMessage.value = ''
    }, 2000)
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not save settings.', true)
  }
}

const formatDate = (date) => {
  if (!date) return 'Flexible'
  return new Date(date).toLocaleDateString()
}

const openEditModal = (artwork) => {
  editingArtwork.value = { ...artwork }
}

const handleUpdate = async () => {
  try {
    const updated = await updateProduct(editingArtwork.value._id, editingArtwork.value)
    artworks.value = artworks.value.map((artwork) => artwork._id === updated._id ? updated : artwork)
    editingArtwork.value = null
    setActionMessage('Product updated.')
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not update product.', true)
  }
}

const saveProfile = async () => {
  try {
    user.value = await updateUserProfile(user.value.username, profileForm.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    profileMessage.value = 'Profile saved.'
    setTimeout(() => {
      profileMessage.value = ''
    }, 2500)
  } catch (error) {
    setActionMessage(error.response?.data?.error || 'Could not save profile.', true)
  }
}

const handleLogout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('admin-token')
  router.push('/login')
}

onMounted(async () => {
  if (isAdminUser.value) return

  const storedUser = localStorage.getItem('user')

  if (!storedUser) {
    router.push('/login')
    return
  }

  user.value = JSON.parse(storedUser)
  settings.value = getStoredSettings()
  applyTheme(settings.value.theme)
  await refreshUser()
  await refreshArtworks()
  await refreshCommissions()
  await refreshGiveaways()
})
</script>
