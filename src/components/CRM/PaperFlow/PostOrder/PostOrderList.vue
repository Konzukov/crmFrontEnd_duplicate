<template>
  <v-container fluid>
    <v-row justify="start">
      <v-col cols="6">
        <v-card>
          <v-card-title>
            <v-switch
                v-model="showAllOrders"
                label="Отобжаражать все отправления"
            ></v-switch>
          </v-card-title>
          <v-card-text>
            <v-list-item-group
                v-model="postOrders"
                multiple
                active-class=""
            >
              <v-list-item v-for="(item,i) in filteredPostOrder" :key="i" :disabled="item['in_shipment']">
                <template v-slot:default="{ active }">
                  <v-list-item-action>
                    <v-checkbox :disabled="item['in_shipment']" v-model="postOrdersId" multiple :input-value="active"
                                :value="item['reg_num']"></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>ИД заказа: {{ item['reg_num'] }}</v-list-item-title>
                    <v-list-item-subtitle>
                      Номер: {{ item['order_num'] }} | Получатель: {{ item | recipient }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>Адрес получателя:
                      {{ item | address }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-list-item>
            </v-list-item-group>
          </v-card-text>
          <v-card-actions>
            <v-btn color="success" :disabled="!!!postOrdersId.length" @click="createShipment">Добавить в партию</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="6">
        <PostMailForm></PostMailForm>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import PostMailForm from "@/components/PostMail/PostMailForm";
import {mapGetters} from 'vuex'
import customConst from "@/const/customConst";
import {saveAs} from 'file-saver';

export default {
  name: "PostOrderList",
  data: () => ({
    showAllOrders: false,
    postOrders: [],
    postOrdersId: [],
  }),
  computed: {
    ...mapGetters({
      postOrderList: 'postOrderData'
    }),
    filteredPostOrder(){
      return this.postOrderList.filter(obj=>{
        if (this.showAllOrders){
          return obj
        } else {
          return  !obj['in_shipment']
        }

      })
    }
  },
  methods: {
    addToOrders(id) {
      this.postOrdersId.push(id)
    },
    createShipment() {
      let formData = new FormData()
      for (let item of this.postOrdersId) {
        formData.append('shipment_id', item)
      }
      this.$http({
        method: "POST",
        url: customConst.PAPERFLOW_API + 'post-order/create-shipment/',
        data: formData,
        responseType: 'blob'
      }).then(res => {
        const contentDisposition = res.headers['content-disposition'];
        let fileName = 'forms_all.zip';
        if (contentDisposition) {
          const fileNameMatch =
              contentDisposition.match(/filename="(.+)"/);
          console.log('fileNameMatch', fileNameMatch);
          if (fileNameMatch.length === 2) {
            fileName = fileNameMatch[1];
          }
        }
        saveAs(res.data, fileName)
      })
    }
  },
  filters: {
    recipient(item) {
      if (item.legal_recipient) {
        return item.legal_recipient.name
      } else if (item.physical_recipient) {
        return item.physical_recipient['full_name']
      }
    },
    address(item) {
      if (item.legal_recipient) {
        return item.legal_recipient['legal_address']
      } else if (item.physical_recipient) {
        return item.physical_recipient
      }
    }
  },
  created() {
    this.$store.dispatch('getPostOrder')
  },
  components: {
    PostMailForm
  }
}
</script>

<style scoped>
.v-card__text {
  max-height: 70vh;
  min-height: 70vh;
}
</style>