package model;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

public class Cart {

    // 购物车条目的集合，使用Map，key是商品ID
    private Map<Integer, CartItem> items = new HashMap<>();

    /**
     * 获取所有购物车条目
     */
    public Collection<CartItem> getItems() {
        return items.values();
    }

    /**
     * 添加商品到购物车
     */
    public void add(Goods goods, int quantity) {
        int goodsId = goods.getId();
        if (items.containsKey(goodsId)) {
            // 如果已存在，更新数量
            CartItem existingItem = items.get(goodsId);
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {
            // 如果不存在，创建新条目
            CartItem newItem = new CartItem(goods, quantity);
            items.put(goodsId, newItem);
        }
    }

    /**
     * 更新商品数量
     */
    public void update(int goodsId, int quantity) {
        if (items.containsKey(goodsId)) {
            if (quantity > 0) {
                items.get(goodsId).setQuantity(quantity);
            } else {
                // 数量为0，则移除
                items.remove(goodsId);
            }
        }
    }

    /**
     * 移除商品
     */
    public void remove(int goodsId) {
        items.remove(goodsId);
    }

    /**
     * 清空购物车
     */
    public void clear() {
        items.clear();
    }

    /**
     * 计算总价
     */
    public float getTotalPrice() {
        float total = 0;
        for (CartItem item : items.values()) {
            total += item.getTotalPrice();
        }
        return total;
    }
}