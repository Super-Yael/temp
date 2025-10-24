package model;

public class CartItem {

    private Goods goods;    // 商品对象
    private int quantity;   // 数量

    public CartItem(Goods goods, int quantity) {
        this.goods = goods;
        this.quantity = quantity;
    }

    public Goods getGoods() {
        return goods;
    }

    public void setGoods(Goods goods) {
        this.goods = goods;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    // 用于计算小计
    public float getTotalPrice() {
        return goods.getPrice() * quantity;
    }
}