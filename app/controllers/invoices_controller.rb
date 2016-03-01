require 'prawn'
require 'prawn/table'

class InvoicesController < ApplicationController
  def index
    @invoices = Invoice.find(:all, :conditions=> {"clients.user_id"=>current_user.id}, :order=>"id ASC", :joins=> :client)
    render json: @invoices
  end

  def show
	  respond_to do |format|
		  format.pdf { render_pdf }
    end
  end

  def create
    @invoice = Invoice.create!(invoice_params.merge(:user_id => session[:user_id]))

    render json: @invoice
  end

  def update
    @invoice = Invoice.find(params[:id])
    @invoice.update!(invoice_params)
    render json: @invoice
  end

  def destroy
    Invoice.destroy(params[:id])
    head :ok
  end

  def setSequence
    @invoice = Invoice.find(params[:id])
    # unlink all tasks from invoice
    @invoice.tasks.each do |task|
      task.update(invoice_id: 0)
    end

    # get list of tasks to be modified
    @tasks = params[:tasks].split(",")
    @tasks.to_enum.with_index.each do |task_id, index|
      @task = Task.find(task_id)
      @task.task_list_id = 0
      @task.invoice_id = @invoice.id
      @task.sort_order = @tasks.length - index
      @task.save
    end

    head :ok
  end

  protected
    def invoice_params
      params.require(:invoice).permit(:client_id, :description)
    end


    def render_pdf
      @invoice = Invoice.find(params[:id])
      @user = User.find(session[:user_id])
      name = "invoice#{@invoice.number}_#{@invoice.client.name.downcase.split.join('_')}.pdf"
      mime = "application/pdf"

      pdf = Prawn::Document.new
      pdf.font "Helvetica"
      pdf.define_grid(:columns => 12, :rows => 50, :gutter => 10)

      pdf.grid([0,0], [4,6]).bounding_box do
        pdf.text  "Invoice \##{@invoice.number}", size: 24, color: '527c22'
        pdf.text @invoice.description, color: '527c22'
      end

      pdf.grid([0,6], [4,11]).bounding_box do
        pdf.text "Totaling $#{@invoice.total}", color: '527c22'
        pdf.text "& due #{(@invoice.due or Time.now + 2592000).strftime('%Y-%m-%d')}", color: '527c22'
      end

      pdf.grid([3,0], [3,11]).bounding_box do
        pdf.stroke_color 'efefef'
        pdf.stroke_horizontal_rule
      end

      pdf.grid([3,0], [7,6]).bounding_box do
        pdf.move_down 10
        pdf.text "Attention", size: 9, color: '999999'
        pdf.text @invoice.client.name, size: 18, color: '527c22'
        pdf.text @invoice.client.email, color: '527c22'
      end

      pdf.grid([3,6], [7,11]).bounding_box do
        pdf.move_down 10
        pdf.text "Pay to the order of", size: 9, color: '999999'
        pdf.text @user.name, size: 18, color: '527c22'
        pdf.text @user.email, color: '527c22'
      end

      items = [["Description", "Time", "Total"]]
      items += @invoice.tasks.each.map do |item|
        [
          item[:description],
          item.formatted_duration,
          item.task_earnings
        ]
      end
      if(@invoice.duration > 60)
        minutes = @invoice.duration / 60
        hours   = minutes / 60
        minutes = minutes % 60
        duration = "%02d:%02d"%[hours,minutes]
      else
        duration = %Q|#{(@invoice.duration).floor}s|
      end
      items += [
        ["Total time", duration, ""],
        ["", "", "Total due"],
        [{content: @invoice.formatted_total, colspan: 3}]
      ]

      pdf.table items,
        :header => true,
        :cell_style => {border_width: 0},
        :column_widths => {0 => 390, 1 => 60, 2 => 90},
        :row_colors => ["f8f7e9", "FFFFFF"] do
          columns(1..2).align = :right
          row(0).border_top_width = 1
          row(0).border_top_color = 'efefef'
          row(0).columns(0..2).font_style = :italic
          row(0).columns(0..2).text_color = '666666'

          rows(0..-3).columns(1).border_right_width = 1
          columns(1).border_color = 'efefef'

          row(-3).border_top_width = 1
          row(-2).columns(0..1).border_top_width = 1
          row(-3).columns(0).align = :right
          row(-3..-2).border_color = 'efefef'
          row(-3..-1).background_color = 'ffffff'
          row(-2).size = 8
          row(-2).valign = :bottom
          row(-1).size = 18
          row(-1).align = :right
          row(-1).valign = :top
      end

      send_data pdf.render, filename: name, type: mime
    end
end
