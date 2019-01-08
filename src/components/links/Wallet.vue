<template>
  <span class="block md:inline-block">
    <template v-if="!type">
      <span v-if="isKnown">
        <router-link :to="{ name: 'wallet', params: { address: walletAddress } }" class="flex items-center">
          <span v-tooltip="getAddress()">
            {{ knownWallets[address] }}
          </span>
          <svg
           v-tooltip="$t('This is an unclaimed verified address')"
           xmlns="http://www.w3.org/2000/svg"
           xmlns:xlink="http://www.w3.org/1999/xlink"
           x="0px" y="0px"
           width="20px" height="20px" viewBox="0 0 110.4 106.37"
           class="flex flex-none ml-2">
          <path fill-rule="evenodd" fill="currentColor" d="M62.74,5.63l5.27,4a.92.92,0,0,0,.64.19l6.61-.55A12.39,12.39,0,0,1,88,17.46l2.24,6.24a1,1,0,0,0,.44.51l5.86,3.11A12.41,12.41,0,0,1,102.76,41l-1.49,6.47a.9.9,0,0,0,.1.66L104.61,54a12.37,12.37,0,0,1-2.14,14.92l-4.75,4.64a1,1,0,0,0-.28.61l-.39,6.62a12.4,12.4,0,0,1-9.88,11.4l-6.5,1.33a1,1,0,0,0-.56.37l-3.92,5.36a12.38,12.38,0,0,1-14.46,4.24l-6.19-2.39a1,1,0,0,0-.68,0l-6.18,2.39a12.39,12.39,0,0,1-14.47-4.24l-3.92-5.36a.91.91,0,0,0-.56-.37l-6.5-1.33a12.38,12.38,0,0,1-9.87-11.4L13,74.13a.89.89,0,0,0-.28-.61L7.93,68.88A12.37,12.37,0,0,1,5.79,54L9,48.17a1,1,0,0,0,.09-.66L7.65,41a12.39,12.39,0,0,1,6.26-13.72l5.86-3.11a1,1,0,0,0,.44-.51l2.24-6.24A12.39,12.39,0,0,1,35.14,9.31l6.61.55a1,1,0,0,0,.65-.19l5.26-4A12.39,12.39,0,0,1,62.74,5.63Z"/>
          <path fill="white" d="M76.45,42.05h0a3.43,3.43,0,0,0-4.84,0L49.74,63.91,38.8,53A3.45,3.45,0,0,0,34,53h0a3.43,3.43,0,0,0,0,4.84L47.32,71.18a3.43,3.43,0,0,0,4.84,0L76.45,46.89A3.43,3.43,0,0,0,76.45,42.05Z"/>
          </svg>
        </router-link>
      </span>
      <router-link v-else v-tooltip="getAddress()" :to="{ name: 'wallet', params: { address: walletAddress } }">
        <span v-if="hasDefaultSlot"><slot></slot></span>
        <span v-else-if="delegate">{{ delegate.username }}</span>
        <span v-else-if="address">
          <span class="hidden md:inline-block">{{ trunc ? truncate(address) : address }}</span>
          <span class="md:hidden">{{ truncate(address) }}</span>
        </span>
      </router-link>
    </template>

    <span v-else-if="type === 1">{{ $t("2nd Signature Registration") }}</span>
    <span v-else-if="type === 2">{{ $t("Delegate Registration") }}</span>
    <span v-else-if="type === 3">
      <router-link v-if="votedDelegateAddress" v-tooltip="votedDelegateAddress" :to="{ name: 'wallet', params: { address: votedDelegateAddress } }">
        <span :class="getVoteColor">{{ isUnvote ? $t("Unvote") : $t("Vote") }} <span class="italic">({{ votedDelegateUsername }})</span></span>
      </router-link>
    </span>
    <span v-else-if="type === 4">{{ $t("Multisignature Registration") }}</span>
    <span v-else-if="type === 5">{{ $t("IPFS") }}</span>
    <span v-else-if="type === 6">{{ $t("Timelock Transfer") }}</span>
    <span v-else-if="type === 7">{{ $t("Multipayment") }}</span>
    <span v-else-if="type === 8">{{ $t("Delegate Resignation") }}</span>
  </span>
</template>

<script type="text/ecmascript-6">
import { mapGetters } from 'vuex'

export default {
  props: {
    address: {
      type: String,
    },
    asset: {
      type: Object,
      required: false
    },
    publicKey: {
      type: String,
    },
    type: {
      type: Number,
    },
    trunc: {
      type: Boolean,
      default: true
    }
  },

  data: () => ({
    delegate: null,
    votedDelegate: null
  }),

  mounted() {
    this.determine()
  },

  watch: {
    delegates() {
      this.determine()
    },
    address() {
      this.determine()
    },
    publicKey() {
      this.determine()
    },
  },

  computed: {
    ...mapGetters('delegates', ['delegates']),
    ...mapGetters('network', ['knownWallets']),

    isKnown() {
      return this.knownWallets.hasOwnProperty(this.address)
    },

    walletAddress() {
      return this.delegate ? this.delegate.address : this.address
    },

    hasDefaultSlot() {
      return !!this.$slots.default
    },

    getVoteColor() {
      return this.isUnvote ? 'text-red' : 'text-green'
    },

    isUnvote() {
      if (this.asset && this.asset.votes) {
        const vote = this.asset.votes[0]
        return vote.charAt(0) === '-'
      }
      return false
    },

    votePublicKey() {
      if (this.asset && this.asset.votes) {
        const vote = this.asset.votes[0]
        return vote.substr(1)
      }
      return ''
    },

    votedDelegateAddress() {
      return this.votedDelegate ? this.votedDelegate.address : ''
    },

    votedDelegateUsername() {
      return this.votedDelegate ? this.votedDelegate.username : ''
    }
  },

  methods: {
    determine() {
      this.address ? this.findByAddress() : this.findByPublicKey()
      if (this.votePublicKey) {
        this.determineVote()
      }
    },

    determineVote() {
      this.votedDelegate = this.delegates.find(d => d.publicKey === this.votePublicKey)
    },

    findByAddress() {
      this.delegate = this.delegates.find(d => d.address === this.address)
    },

    findByPublicKey() {
      this.delegate = this.delegates.find(d => d.publicKey === this.publicKey)
    },

    getAddress() {
      const knownOrDelegate = this.isKnown || this.delegate
      const truncated = !this.hasDefaultSlot && this.trunc

      if (knownOrDelegate || truncated) {
        return this.walletAddress
      }

      return false
    },
  },
}
</script>
