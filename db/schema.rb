# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150927050232) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "clients", force: true do |t|
    t.string   "name"
    t.string   "address"
    t.string   "city"
    t.string   "state"
    t.string   "zip"
    t.string   "country"
    t.string   "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "user_id"
  end

  create_table "commands", force: true do |t|
    t.string   "undo_message"
    t.text     "original_object"
    t.datetime "created_at"
  end

  create_table "identities", force: true do |t|
    t.string   "uid"
    t.string   "provider"
    t.string   "token"
    t.datetime "expires"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "identities", ["user_id"], name: "index_identities_on_user_id", using: :btree

  create_table "invoices", force: true do |t|
    t.string   "description"
    t.integer  "client_id"
    t.datetime "created"
    t.datetime "due"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "number"
    t.string   "task_order"
  end

  create_table "log_entries", force: true do |t|
    t.integer  "task_id"
    t.string   "action"
    t.datetime "created_at"
  end

  create_table "task_lists", force: true do |t|
    t.integer  "owner_id"
    t.string   "title"
    t.text     "task_order"
    t.integer  "default_rate_cents"
    t.string   "default_currency"
    t.datetime "updated_at"
  end

  create_table "tasks", force: true do |t|
    t.integer  "task_list_id"
    t.string   "description"
    t.integer  "duration_cache"
    t.integer  "rate_cents"
    t.string   "currency"
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.integer  "invoice_id"
  end

  create_table "users", force: true do |t|
    t.string   "name"
    t.string   "email"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
