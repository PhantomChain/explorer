import NodeService from '@/services/node'

class TransactionService {
  async latest(limit = 25) {
    const response = await NodeService.get('transactions', {
      params: {
        orderBy: 'timestamp:desc',
        limit
      }
    })
    return this.fixTimestamp(response.data.transactions)
  }

  async filterByType(page, type, limit = 25) {
    const offset = (page > 1) ? (page - 1) * limit : 0

    const response = await NodeService.get('transactions', {
      params: {
        orderBy: 'timestamp:desc',
        limit,
        offset,
        type: (type === -1) ? '' : type
      }
    })
    return response.data.transactions
  }

  async find(id) {
    const response = await NodeService.get('transactions/get', {
      params: {
        id
      }
    })
    return this.fixTimestamp(response.data.transaction)
  }

  async findByBlock(id, page = 1, limit = 25) {
    const offset = page > 1 ? (page - 1) * limit : 0

    const response = await NodeService.get('transactions', {
      params: {
        blockId: id,
        limit,
        offset,
        orderBy: 'timestamp:desc'
      }
    })
    return this.fixTimestamp(response.data.transactions)
  }

  async latestRegistrations() {
    const response = await NodeService.get('transactions', {
      params: {
        orderBy: 'timestamp:desc',
        limit: 5,
        type: 2
      }
    })
    return this.fixTimestamp(response.data.transactions)
  }

  async latestVotes() {
    const response = await NodeService.get('transactions', {
      params: {
        orderBy: 'timestamp:desc',
        limit: 5,
        type: 3
      }
    })
    return this.fixTimestamp(response.data.transactions)
  }

  async allByAddress(address, page = 1, limit = 25) {
    const offset = page > 1 ? (page - 1) * limit : 0

    const response = await NodeService.get('transactions', {
      params: {
        senderId: address,
        recipientId: address,
        limit,
        offset,
        orderBy: 'timestamp:desc'
      }
    })
    return this.fixTimestamp(response.data.transactions)
  }

  async sentByAddress(senderId, page = 1, limit = 25) {
    const offset = page > 1 ? (page - 1) * limit : 0

    const response = await NodeService.get('transactions', {
      params: {
        senderId,
        limit,
        offset,
        orderBy: 'timestamp:desc'
      }
    })
    return this.fixTimestamp(response.data.transactions)
  }

  async receivedByAddress(recipientId, page = 1, limit = 25) {
    const offset = page > 1 ? (page - 1) * limit : 0

    const response = await NodeService.get('transactions', {
      params: {
        recipientId,
        limit,
        offset,
        orderBy: 'timestamp:desc'
      }
    })
    return this.fixTimestamp(response.data.transactions)
  }

  async sentByAddressCount(senderId) {
    const response = await NodeService.get('transactions', {
      params: {
        senderId,
        limit: 1
      }
    })
    return response.data.count
  }

  async receivedByAddressCount(recipientId) {
    const response = await NodeService.get('transactions', {
      params: {
        recipientId,
        limit: 1
      }
    })
    return response.data.count
  }

  async findByBlockCount(blockId) {
    const response = await NodeService.get('transactions', {
      params: {
        blockId,
        limit: 1
      }
    })
    return response.data.count
  }

  async paginate(page, limit = 25) {
    const offset = (page > 1) ? (page - 1) * limit : 0

    const response = await NodeService.get('transactions', {
      params: {
        orderBy: 'timestamp:desc',
        limit,
        offset
      }
    })
    return this.fixTimestamp(response.data.transactions)
  }

  async paginateByAddress(address, page = 1, limit = 25) {
    const offset = (page > 1) ? (page - 1) * limit : 0

    const response = await NodeService.get('transactions', {
      params: {
        senderId: address,
        recipientId: address,
        limit,
        offset,
        orderBy: 'timestamp:desc'
      }
    })
    return this.fixTimestamp(response.data.transactions)
  }

  fixTimestamp(data) {
    const FIX_OFFSET = 56415597

    if (data.length) {
      data.forEach(transaction => {
        if (transaction.timestamp) {
          transaction.timestamp -= FIX_OFFSET
        }
      })
    } else {
      data.timestamp -= FIX_OFFSET
    }

    return data
  }
}

export default new TransactionService()
