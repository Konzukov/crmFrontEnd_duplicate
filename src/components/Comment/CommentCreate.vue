<template>
    <v-container fluid class="comment-place mt-5">
        <v-form>
            <v-row>
                <v-textarea
                        outlined
                        label="Комментарий"
                        rows="4"
                        v-model="comment.text"
                ></v-textarea>
            </v-row>
        </v-form>
        <v-row justify="center">
            <v-btn color="success" @click="addComment">Добавить комментарий</v-btn>
        </v-row>
    </v-container>
</template>

<script>
    import moment from 'moment'

    export default {
        name: "CommentCreate",
        props: ['task'],
        data() {
            return {
                comment: {
                    author: null,
                    date: moment().format('YYYY-MM-DD HH:mm'),
                    task: this.task,
                    text: null,
                    comment: null, // for parent comment
                }
            }
        },
        methods: {
            getFormData() {
                let formData = new FormData()
                Object.keys(this.comment).forEach(key => {
                    formData.set(key, this.comment[key])
                })
                return formData
            },
            addComment() {
                let formData = this.getFormData()
                let taskID = this.comment.task
                this.$store.dispatch('addComment', formData).then(() => {
                    Object.assign(this.$data, this.$options.data())
                    this.comment.task = taskID
                })
            }
        }
    }
</script>

<style scoped>
</style>